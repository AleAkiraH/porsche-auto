import json
import logging
from pymongo import MongoClient
from bson.json_util import dumps, loads
from datetime import datetime
from bson import ObjectId

# Configuração do logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def log_entrada_saida(func):
    def wrapper(*args, **kwargs):
        func_name = func.__name__
        # Log de entrada
        logger.info(f"🎯 Iniciando função: {func_name}")
        logger.info(f"📥 Payload recebido:\n{json.dumps(args[0], indent=2)}")
        
        # Executa a função e mede o tempo
        start_time = datetime.now()
        result = func(*args, **kwargs)
        execution_time = (datetime.now() - start_time).total_seconds()
        
        # Log de saída
        logger.info(f"📤 Retorno de {func_name}:\n{json.dumps(result, indent=2)}")
        logger.info(f"⏱️ Tempo de execução: {execution_time:.2f}s")
        logger.info(f"✅ {func_name} finalizada com sucesso")
        
        return result
    return wrapper

# Conectar ao MongoDB
client = MongoClient("mongodb+srv://administrador:administrador@cluster0.8vjnvh9.mongodb.net/PorscheAuto?retryWrites=true&w=majority")
db = client.PorscheAuto
collection_cliente = db.cliente
collection_veiculo = db.veiculo
collection_orcamento = db.orcamento

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, datetime):
            return o.isoformat()
        return json.JSONEncoder.default(self, o)

def padronizar_resposta(status_code, message):
    return {
        'statusCode': status_code,
        'body': json.dumps({'message': message}, ensure_ascii=False, cls=JSONEncoder)
    }

def validar_campos_obrigatorios(campos):
    for campo, valor in campos.items():
        if not valor:
            logger.warning("Cadastro falhou: campo %s é obrigatório.", campo)
            return False
    return True

@log_entrada_saida
def buscar_orcamento_detalhes(body):
    placa = body.get('placa')
    logger.info(f"🔍 Buscando detalhes do orçamento para placa: {placa}")
    
    # Busca o orçamento pela placa
    orcamento = collection_orcamento.find_one({'placaVeiculo': placa})
    
    if not orcamento:
        logger.warning("Orçamento não encontrado para a placa: %s", placa)
        return padronizar_resposta(404, 'Orçamento não encontrado.')
    
    # Busca o veículo correspondente
    veiculo = collection_veiculo.find_one({'placa': placa})
    
    if not veiculo:
        logger.warning("Veículo não encontrado para a placa: %s", placa)
        return padronizar_resposta(404, 'Veículo não encontrado.')
    
    # Busca o cliente correspondente
    cliente = collection_cliente.find_one({'cpf': veiculo['cpf_cliente']})
    
    # Monta o resultado final
    resultado = {
        'dataHora': orcamento['dataHora'],
        'dataEntrega': orcamento['dataEntrega'],
        'descricaoServico': orcamento['descricaoServico'],
        'valorServico': orcamento['valorServico'],
        'placaVeiculo': orcamento['placaVeiculo'],
        'nomeCliente': cliente['nome'],
        'telefoneCliente': cliente['telefone'],
        'cpfCliente': cliente['cpf'],
        'fotos': veiculo['fotos']
    }
    
    return padronizar_resposta(200, resultado)

@log_entrada_saida
def cadastrar_orcamento(payload):
    body = payload.get('body', {})
    
    logger.info("📝 Iniciando cadastro de orçamento")
    
    # Verifica campos obrigatórios
    campos_obrigatorios = {
        'placa': body.get('placa'),
        'descricao': body.get('descricao'),
        'previsaoEntrega': body.get('previsaoEntrega'),
        'valor': body.get('valor'),
        'dataHora': body.get('dataHora')
    }

    if not all(campos_obrigatorios.values()):
        missing = [k for k, v in campos_obrigatorios.items() if not v]
        logger.warning(f"Campos obrigatórios faltando: {missing}")
        return padronizar_resposta(400, 'Todos os campos são obrigatórios.')

    # Verifica se o veículo existe
    veiculo = collection_veiculo.find_one({'placa': body['placa']})
    if not veiculo:
        return padronizar_resposta(404, 'Veículo não encontrado.')
    
    # Cria o documento do orçamento
    orcamento = {
        'placa': body['placa'],
        'descricao': body['descricao'],
        'previsaoEntrega': body['previsaoEntrega'],
        'valor': body['valor'],
        'fotos': body.get('fotos', []),
        'status': 'pendente',
        'dataHora': body['dataHora'],
    }
    
    try:
        result = collection_orcamento.insert_one(orcamento)
        logger.info("Orçamento cadastrado com sucesso")
        return padronizar_resposta(201, 'Orçamento cadastrado com sucesso!')
        
    except Exception as e:
        logger.error(f"Erro ao cadastrar orçamento: {str(e)}")
        return padronizar_resposta(500, f'Erro ao cadastrar orçamento: {str(e)}')

@log_entrada_saida
def buscar_orcamentos(body):
    logger.info("🔍 Buscando todos os orçamentos")
    try:
        orcamentos = list(collection_orcamento.find({}))
        
        # Converte os ObjectIds para string
        for orc in orcamentos:
            orc['_id'] = str(orc['_id'])
        
        logger.info(f"Encontrados {len(orcamentos)} orçamentos")
        return padronizar_resposta(200, orcamentos)
        
    except Exception as e:
        logger.error(f"Erro ao buscar orçamentos: {str(e)}")
        return padronizar_resposta(500, f'Erro ao buscar orçamentos: {str(e)}')

@log_entrada_saida
def cadastrar_cliente(body):
    logger.info("Iniciando cadastro do cliente: %s", body.get('nome'))

    # Verifica se o CPF já existe
    if collection_cliente.find_one({'cpf': body.get('cpf')}):
        logger.warning("Cadastro falhou: CPF %s já existe.", body.get('cpf'))
        return padronizar_resposta(400, 'CPF já existe.')

    # Verifica se os campos obrigatórios estão presentes
    if not validar_campos_obrigatorios({'nome': body.get('nome'), 'telefone': body.get('telefone'), 'cpf': body.get('cpf')}):
        return padronizar_resposta(400, 'Todos os campos são obrigatórios.')

    # Cria um novo dicionário com apenas os campos desejados
    cadastro_cliente = {
        'nome': body.get('nome'),
        'telefone': body.get('telefone'),
        'cpf': body.get('cpf')
    }

    # Insere apenas o objeto com os campos desejados
    collection_cliente.insert_one(cadastro_cliente)

    logger.info("Cliente cadastrado com sucesso: %s", cadastro_cliente)
    return padronizar_resposta(201, 'Cliente cadastrado com sucesso!')

@log_entrada_saida
def buscar_cliente(body):
    cpf = body.get('cpf')
    logger.info(f"🔍 Buscando cliente CPF: {cpf}")
    if not cpf:
        return padronizar_resposta(400, 'CPF é obrigatório.')
    
    # Consulta para retornar um cliente pelo CPF
    cliente = collection_cliente.find_one({'cpf': cpf})

    if cliente:
        logger.info("Cliente encontrado: %s", cliente)
        return {
            'statusCode': 200,
            'body': dumps(cliente, ensure_ascii=False)
        }
    else:
        logger.warning("Cliente não encontrado com CPF: %s", cpf)
        return padronizar_resposta(404, 'Cliente não encontrado.')

@log_entrada_saida
def cadastrar_veiculo(payload):
    # Corrigir o acesso ao body do payload
    body = payload.get('body', {})
    logger.info("Iniciando cadastro do veículo: %s", body.get('placa'))
    
    # Limpar apenas a placa, manter CPF formatado
    placa = body.get('placa', '').strip()
    cpf_cliente = body.get('cpfCliente', '').strip()
    fotos = body.get('fotos', [])
    
    logger.info(f"Dados normalizados - Placa: {placa}, CPF: {cpf_cliente}")
    
    # Verifica se a placa já está cadastrada
    if collection_veiculo.find_one({'placa': placa}):
        logger.warning("Cadastro falhou: Placa %s já existe.", placa)
        return padronizar_resposta(400, 'Placa já existe.')
    
    # Verifica se o CPF do cliente existe (usando CPF formatado)
    cliente = collection_cliente.find_one({'cpf': cpf_cliente})
    if not cliente:
        logger.warning("Cadastro falhou: CPF do cliente %s não encontrado.", cpf_cliente)
        return padronizar_resposta(400, 'CPF do cliente não encontrado.')
    
    # Verifica se os campos obrigatórios estão presentes
    if not validar_campos_obrigatorios({'placa': placa, 'cpfCliente': cpf_cliente, 'fotos': fotos}):
        return padronizar_resposta(400, 'Placa, CPF do cliente e fotos são obrigatórios.')
    
    # Cria um novo dicionário com apenas os campos desejados
    cadastro_veiculo = {
        'placa': placa,
        'cpf_cliente': cpf_cliente,  # Mantém o CPF formatado
        'fotos': fotos
    }
    
    # Insere apenas o objeto com os campos desejados
    collection_veiculo.insert_one(cadastro_veiculo)
    logger.info("Veículo cadastrado com sucesso: %s", cadastro_veiculo)
    return padronizar_resposta(201, 'Veículo cadastrado com sucesso!')

@log_entrada_saida
def buscar_veiculo(payload):
    body = payload.get('body', {})
    placa = body.get('placa')
    logger.info(f"🔍 Buscando veículo placa: {placa}")
    if not placa:
        return padronizar_resposta(400, 'Placa é obrigatória.')
    
    veiculo = collection_veiculo.find_one({'placa': placa})
    if veiculo:
        logger.info("Veículo encontrado: %s", veiculo)
        return {
            'statusCode': 200,
            'body': dumps(veiculo, ensure_ascii=False)
        }
    else:
        logger.warning("Veículo não encontrado com placa: %s", placa)
        return padronizar_resposta(404, 'Veículo não encontrado.')

@log_entrada_saida
def buscar_clientes_e_veiculos(body):
    logger.info("📋 Iniciando busca de todos os clientes e veículos")
    # Busca todos os clientes
    clientes = list(collection_cliente.find({}))
    # Busca todos os veículos
    veiculos = list(collection_veiculo.find({}))
    # Criar um dicionário para armazenar os resultados
    resultados = []
    # Mapeia os veículos por CPF do cliente
    veiculos_por_cpf = {}
    for veiculo in veiculos:
        cpf_cliente = veiculo.get('cpf_cliente')
        if cpf_cliente not in veiculos_por_cpf:
            veiculos_por_cpf[cpf_cliente] = []
        veiculos_por_cpf[cpf_cliente].append(veiculo.get('placa'))
    
    # Monta a lista de resultados combinando todos os clientes e seus veículos
    for cliente in clientes:
        cpf = cliente.get('cpf')
        resultado = {
            'nome': cliente.get('nome'),
            'telefone': cliente.get('telefone'),
            'cpf': cpf,
            'placa': veiculos_por_cpf.get(cpf, [])  # Adiciona a lista de placas ou uma lista vazia
        }
        resultados.append(resultado)
    
    logger.info("Resultados encontrados: %s", resultados)
    return padronizar_resposta(200, resultados)

@log_entrada_saida
def cadastrar_cliente_e_veiculo(payload):
    logger.info("🚀 Iniciando cadastro unificado")
    
    try:
        body = payload.get('body', {})
        
        # Validar dados do cliente
        cliente_dados = {
            'nome': body.get('nome'),
            'cpf': body.get('cpf'),
            'telefone': body.get('telefone'),
            'email': body.get('email', ''),
            'endereco': body.get('endereco', '')
        }
        logger.info(f"👤 Dados do cliente: {json.dumps(cliente_dados, indent=2)}")
        
        # Validar dados do veículo
        veiculo_dados = {
            'placa': body.get('placa'),
            'cpf_cliente': body.get('cpf'),
            'fotos': body.get('fotos', [])
        }
        logger.info(f"🚗 Dados do veículo: {json.dumps({'placa': veiculo_dados['placa'], 'qtd_fotos': len(veiculo_dados['fotos'])}, indent=2)}")
        
        # Validar campos obrigatórios
        campos_obrigatorios = {
            'nome': cliente_dados['nome'],
            'cpf': cliente_dados['cpf'],
            'telefone': cliente_dados['telefone'],
            'placa': veiculo_dados['placa']
        }
        
        if not all(campos_obrigatorios.values()):
            missing_fields = [k for k, v in campos_obrigatorios.items() if not v]
            logger.warning(f"❌ Campos obrigatórios faltando: {missing_fields}")
            return padronizar_resposta(400, f'Campos obrigatórios não preenchidos: {", ".join(missing_fields)}')
        
        # Verificações
        if collection_cliente.find_one({'cpf': cliente_dados['cpf']}):
            logger.warning(f"❌ CPF já cadastrado: {cliente_dados['cpf']}")
            return padronizar_resposta(400, 'CPF já cadastrado.')
            
        if collection_veiculo.find_one({'placa': veiculo_dados['placa']}):
            logger.warning(f"❌ Placa já cadastrada: {veiculo_dados['placa']}")
            return padronizar_resposta(400, 'Placa já cadastrada.')
        
        # Cadastros
        logger.info("💾 Salvando cliente no banco...")
        cliente_result = collection_cliente.insert_one(cliente_dados)
        
        logger.info("💾 Salvando veículo no banco...")
        veiculo_result = collection_veiculo.insert_one(veiculo_dados)
        
        # Preparar resposta sem ObjectId
        resposta = {
            'mensagem': 'Cadastro realizado com sucesso!',
            'cliente': {
                **cliente_dados,
                '_id': str(cliente_result.inserted_id)
            },
            'veiculo': {
                'placa': veiculo_dados['placa'],
                '_id': str(veiculo_result.inserted_id),
                'qtd_fotos': len(veiculo_dados['fotos'])
            }
        }
        
        logger.info("✅ Cadastro concluído com sucesso!")
        return padronizar_resposta(201, resposta)
        
    except Exception as e:
        logger.error(f"💥 Erro no cadastro: {str(e)}")
        return padronizar_resposta(500, f'Erro ao realizar cadastro: {str(e)}')

@log_entrada_saida
def excluir_cliente(payload):
    logger.info("🗑️ Iniciando exclusão de cliente")
    
    body = payload.get('body', {})
    cpf = body.get('cpf')
    
    if not cpf:
        logger.warning("❌ CPF não fornecido")
        return padronizar_resposta(400, 'CPF é obrigatório')

    try:
        # Primeiro busca os veículos do cliente
        veiculos = list(collection_veiculo.find({'cpf_cliente': cpf}))
        
        # Remove os veículos do cliente
        if veiculos:
            logger.info(f"🚗 Removendo {len(veiculos)} veículos do cliente")
            collection_veiculo.delete_many({'cpf_cliente': cpf})
        
        # Remove o cliente
        result = collection_cliente.delete_one({'cpf': cpf})
        
        if result.deleted_count > 0:
            logger.info(f"✅ Cliente {cpf} excluído com sucesso")
            return padronizar_resposta(200, 'Cliente excluído com sucesso')
        else:
            logger.warning(f"❌ Cliente {cpf} não encontrado")
            return padronizar_resposta(404, 'Cliente não encontrado')

    except Exception as e:
        logger.error(f"💥 Erro ao excluir cliente: {str(e)}")
        return padronizar_resposta(500, f'Erro ao excluir cliente: {str(e)}')

@log_entrada_saida
def excluir_veiculo(payload):
    logger.info("🗑️ Iniciando exclusão de veículo")
    
    body = payload.get('body', {})
    placa = body.get('placa')
    
    if not placa:
        logger.warning("❌ Placa não fornecida")
        return padronizar_resposta(400, 'Placa é obrigatória')

    try:
        # Remove o veículo
        result = collection_veiculo.delete_one({'placa': placa})
        
        if result.deleted_count > 0:
            logger.info(f"✅ Veículo {placa} excluído com sucesso")
            return padronizar_resposta(200, 'Veículo excluído com sucesso')
        else:
            logger.warning(f"❌ Veículo {placa} não encontrado")
            return padronizar_resposta(404, 'Veículo não encontrado')

    except Exception as e:
        logger.error(f"💥 Erro ao excluir veículo: {str(e)}")
        return padronizar_resposta(500, f'Erro ao excluir veículo: {str(e)}')

@log_entrada_saida
def excluir_orcamento(payload):
    try:
        body = payload.get('body', {})
        # Get and validate ID
        id_orcamento = body.get('id', '').strip()
        logger.info(f"🗑️ Excluindo orçamento: {id_orcamento}")
        
        if not id_orcamento:
            logger.warning("❌ ID não fornecido")
            return padronizar_resposta(400, 'ID do orçamento é obrigatório')
        
        try:
            # Convert to ObjectId
            object_id = ObjectId(id_orcamento)
            
            # Try to delete
            result = collection_orcamento.delete_one({'_id': object_id})
            
            if result.deleted_count > 0:
                logger.info("✅ Orçamento excluído com sucesso")
                return padronizar_resposta(200, 'Orçamento excluído com sucesso')
            else:
                logger.warning("❌ Orçamento não encontrado")
                return padronizar_resposta(404, 'Orçamento não encontrado')
                
        except Exception as e:
            logger.error(f"❌ Erro ao processar ID: {str(e)}")
            return padronizar_resposta(400, 'ID do orçamento inválido')
            
    except Exception as e:
        logger.error(f"💥 Erro ao excluir orçamento: {str(e)}")
        return padronizar_resposta(500, f'Erro ao excluir orçamento: {str(e)}')

@log_entrada_saida
def buscar_cliente_completo(payload):
    logger.info("🔍 Iniciando busca completa do cliente")
    logger.info(f"📥 Payload recebido: {payload}")

    body = payload.get('body', {})
    cpf = body.get('cpf')
    
    logger.info(f"🔍 Buscando cliente com CPF: {cpf}")
    
    if not cpf:
        logger.warning("❌ CPF não fornecido")
        return padronizar_resposta(400, 'CPF é obrigatório')

    try:
        # Busca o cliente
        cliente = collection_cliente.find_one({'cpf': cpf})
        logger.info(f"🔍 Resultado da busca do cliente: {cliente}")
        
        if not cliente:
            logger.warning(f"❌ Cliente não encontrado para o CPF: {cpf}")
            return padronizar_resposta(404, 'Cliente não encontrado')

        # Busca todos os veículos do cliente
        veiculos = list(collection_veiculo.find({'cpf_cliente': cpf}))
        logger.info(f"🔍 Veículos encontrados: {len(veiculos)}")
        
        # Monta o resultado
        resultado = {
            'cliente': {
                'nome': cliente.get('nome'),
                'cpf': cliente.get('cpf'),
                'telefone': cliente.get('telefone'),
                'email': cliente.get('email', ''),
                'endereco': cliente.get('endereco', '')
            },
            'veiculos': [{
                'placa': v.get('placa'),
                'fotos': v.get('fotos', [])
            } for v in veiculos]
        }
        
        logger.info(f"✅ Dados montados com sucesso: {resultado}")
        return padronizar_resposta(200, resultado)

    except Exception as e:
        logger.error(f"💥 Erro ao buscar dados completos: {str(e)}")
        return padronizar_resposta(500, f'Erro ao buscar dados: {str(e)}')

@log_entrada_saida
def atualizar_cliente(payload):
    logger.info("🔄 Iniciando atualização do cliente")
    
    try:
        body = payload.get('body', {})
        
        # Validação mais específica dos campos
        if not body.get('cpf_antigo'):
            logger.warning("❌ CPF antigo não fornecido")
            return padronizar_resposta(400, 'CPF antigo é obrigatório')

        # Extrair dados do cliente
        cliente_dados = {
            'nome': body.get('nome'),
            'cpf': body.get('cpf'),
            'telefone': body.get('telefone'),
            'email': body.get('email', ''),
            'endereco': body.get('endereco', '')
        }

        # Validar campos obrigatórios do cliente
        campos_obrigatorios = ['nome', 'cpf', 'telefone']
        for campo in campos_obrigatorios:
            if not cliente_dados.get(campo):
                logger.warning(f"❌ Campo obrigatório faltando: {campo}")
                return padronizar_resposta(400, f'Campo {campo} é obrigatório')
        
        # Atualiza o cliente
        result = collection_cliente.update_one(
            {'cpf': body['cpf_antigo']},
            {'$set': cliente_dados}
        )
        
        if result.modified_count > 0:
            # Se o CPF foi alterado, atualiza a referência nos veículos
            if body['cpf_antigo'] != cliente_dados['cpf']:
                collection_veiculo.update_many(
                    {'cpf_cliente': body['cpf_antigo']},
                    {'$set': {'cpf_cliente': cliente_dados['cpf']}}
                )
            
            logger.info("✅ Cliente atualizado com sucesso")
            return padronizar_resposta(200, 'Cliente atualizado com sucesso')
        else:
            logger.warning("❌ Cliente não encontrado")
            return padronizar_resposta(404, 'Cliente não encontrado')

    except Exception as e:
        logger.error(f"💥 Erro ao atualizar cliente: {str(e)}")
        return padronizar_resposta(500, f'Erro ao atualizar cliente: {str(e)}')

@log_entrada_saida
def atualizar_orcamento(payload):
    try:
        body = payload.get('body', {})
        id_orcamento = body.get('id')
        
        if not id_orcamento:
            logger.error("❌ ID do orçamento não fornecido")
            return padronizar_resposta(400, 'ID do orçamento é obrigatório')
        
        campos_obrigatorios = {
            'placa': body.get('placa'),
            'descricao': body.get('descricao'),
            'previsaoEntrega': body.get('previsaoEntrega'),
            'valor': body.get('valor')
        }
        
        for campo, valor in campos_obrigatorios.items():
            if valor is None:
                logger.error(f"❌ Campo {campo} é obrigatório")
                return padronizar_resposta(400, f'Campo {campo} é obrigatório')
        
        update_fields = {
            'placa': body['placa'],
            'descricao': body['descricao'],
            'previsaoEntrega': body['previsaoEntrega'],
            'valor': body['valor'],
            'status': body.get('status', 'pendente'),
            'fotos': body.get('fotos', []),
            'dataAtualizacao': datetime.now().isoformat()
        }
        
        try:
            object_id = ObjectId(id_orcamento)
            result = collection_orcamento.update_one(
                {'_id': object_id},
                {'$set': update_fields}
            )
            
            if result.modified_count > 0:
                return padronizar_resposta(200, '')  # Retorna string vazia ao invés de mensagem
            else:
                logger.warning("❌ Orçamento não encontrado")
                return padronizar_resposta(404, 'Orçamento não encontrado')
                
        except Exception as e:
            logger.error(f"❌ Erro ao processar atualização: {str(e)}")
            return padronizar_resposta(400, f'Erro ao processar atualização: {str(e)}')
            
    except Exception as e:
        logger.error(f"💥 Erro ao atualizar orçamento: {str(e)}")
        return padronizar_resposta(500, f'Erro ao atualizar orçamento: {str(e)}')

@log_entrada_saida
def buscar_orcamento(body):
    try:
        id_orcamento = body.get('id')
        logger.info(f"🔍 Buscando orçamento: {id_orcamento}")
        
        if not id_orcamento:
            return padronizar_resposta(400, 'ID do orçamento é obrigatório')
            
        try:
            object_id = ObjectId(id_orcamento)
            orcamento = collection_orcamento.find_one({'_id': object_id})
            
            if not orcamento:
                logger.warning("❌ Orçamento não encontrado")
                return padronizar_resposta(404, 'Orçamento não encontrado')
                
            # Format the response with all necessary fields
            formatted_orcamento = {
                'placa': orcamento.get('placa'),
                'descricao': orcamento.get('descricao'),
                'previsaoEntrega': orcamento.get('previsaoEntrega'),
                'valor': orcamento.get('valor'),
                'fotos': orcamento.get('fotos', []),
                'status': orcamento.get('status', 'pendente'),
                'dataHora': orcamento.get('dataHora')
            }
            
            logger.info("✅ Orçamento encontrado com sucesso")
            return padronizar_resposta(200, formatted_orcamento)
            
        except Exception as e:
            logger.error(f"❌ Erro ao processar ID: {str(e)}")
            return padronizar_resposta(400, 'ID do orçamento inválido')
            
    except Exception as e:
        logger.error(f"💥 Erro ao buscar orçamento: {str(e)}")
        return padronizar_resposta(500, f'Erro ao buscar orçamento: {str(e)}')

@log_entrada_saida
def lambda_handler(event, context):
    logger.info("🚀 Lambda iniciada")
    
    try:
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        logger.info(f"⚡ Ação solicitada: {action}")
        
        acoes = {
            'cadastrar_cliente_e_veiculo': cadastrar_cliente_e_veiculo,
            'cadastrar_cliente': cadastrar_cliente,
            'buscar_cliente': buscar_cliente,
            'cadastrar_veiculo': cadastrar_veiculo,
            'buscar_veiculo': buscar_veiculo,
            'buscar_clientes_e_veiculos': buscar_clientes_e_veiculos,
            'cadastrar_orcamento': cadastrar_orcamento,
            'buscar_orcamentos': buscar_orcamentos,
            'buscar_orcamento_detalhes': buscar_orcamento_detalhes,
            'excluir_cliente': excluir_cliente,
            'excluir_veiculo': excluir_veiculo,
            'excluir_orcamento': excluir_orcamento,
            'buscar_cliente_completo': buscar_cliente_completo,
            'atualizar_cliente': atualizar_cliente,
            'atualizar_orcamento': atualizar_orcamento,
            'buscar_orcamento': buscar_orcamento
        }
        
        if action not in acoes:
            logger.warning(f"⚠️ Ação não reconhecida: {action}")
            return padronizar_resposta(400, 'Ação não reconhecida.')
            
        resposta = acoes[action](body)
        logger.info("🏁 Lambda finalizada com sucesso")
        return resposta
        
    except json.JSONDecodeError as e:
        logger.error(f"💥 Erro ao decodificar JSON: {str(e)}")
        return padronizar_resposta(400, 'JSON inválido.')
    except Exception as e:
        logger.error(f"💥 Erro não tratado: {str(e)}")
        return padronizar_resposta(500, 'Erro interno do servidor.')
    finally:
        logger.info("🏁 Lambda finalizada")