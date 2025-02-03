import json
import logging
from pymongo import MongoClient
from bson.json_util import dumps

# Configuração do logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)  # Captura todos os logs de INFO e superior

# Conectar ao MongoDB
client = MongoClient("mongodb+srv://administrador:administrador@cluster0.8vjnvh9.mongodb.net/PorscheAuto?retryWrites=true&w=majority")
db = client.PorscheAuto
collection_cliente = db.cliente
collection_veiculo = db.veiculo
collection_orcamento = db.orcamento

def padronizar_resposta(status_code, message):
    return {
        'statusCode': status_code,
        'body': json.dumps({'message': message}, ensure_ascii=False)  # Garante que a resposta seja em UTF-8
    }

def validar_campos_obrigatorios(campos):
    for campo, valor in campos.items():
        if not valor:
            logger.warning("Cadastro falhou: campo %s é obrigatório.", campo)
            return False
    return True

def buscar_orcamento_detalhes(body):
    placa = body.get('placa')
    logger.info("Buscando detalhes do orçamento para placa: %s", placa)
    
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

def cadastrar_orcamento(body):
    logger.info("Iniciando cadastro do orçamento.")
    
    # Verifica se todos os campos obrigatórios estão presentes
    if not validar_campos_obrigatorios({
        'dataHora': body.get('dataHora'),
        'dataEntrega': body.get('dataEntrega'),
        'descricaoServico': body.get('descricaoServico'),
        'valorServico': body.get('valorServico'),
        'placaVeiculo': body.get('placaVeiculo')
    }):
        return padronizar_resposta(400, 'Todos os campos são obrigatórios.')
    
    # Cria um novo dicionário com os campos do orçamento
    cadastro_orcamento = {
        'dataHora': body.get('dataHora'),
        'dataEntrega': body.get('dataEntrega'),
        'descricaoServico': body.get('descricaoServico'),
        'valorServico': body.get('valorServico'),
        'placaVeiculo': body.get('placaVeiculo')
    }
    
    # Insere o orçamento na coleção
    collection_orcamento.insert_one(cadastro_orcamento)
    logger.info("Orçamento cadastrado com sucesso: %s", cadastro_orcamento)
    return padronizar_resposta(201, 'Orçamento cadastrado com sucesso!')

def buscar_orcamentos(body):
    logger.info("Buscando todos os orçamentos.")
    # Busca todos os orçamentos
    orcamentos = list(collection_orcamento.find({}))
    # Lista para armazenar os orçamentos formatados com informações do cliente
    orcamentos_formatados = []
    for orcamento in orcamentos:
        # Obtemos a placa do veículo do orçamento
        placa_veiculo = orcamento.get('placaVeiculo')
        # Busca o veículo correspondente
        veiculo = collection_veiculo.find_one({'placa': placa_veiculo})
        if veiculo:
            # Obtemos o CPF do cliente a partir do veículo
            cpf_cliente = veiculo.get('cpf_cliente')
            # Busca o cliente correspondente
            cliente = collection_cliente.find_one({'cpf': cpf_cliente})
            # Monta o orçamento formatado
            orcamento_formatado = {
                'dataHora': orcamento.get('dataHora'),
                'dataEntrega': orcamento.get('dataEntrega'),
                'descricaoServico': orcamento.get('descricaoServico'),
                'valorServico': orcamento.get('valorServico').replace('\xa0', ' '),
                'placaVeiculo': placa_veiculo,
                'nomeCliente': cliente.get('nome') if cliente else None,
                'telefoneCliente': cliente.get('telefone') if cliente else None,
                'cpfCliente': cpf_cliente,
                'fotos': veiculo.get('fotos') if veiculo else []  # Inclui as fotos do veículo
            }
            orcamentos_formatados.append(orcamento_formatado)
    # Retorna os orçamentos encontrados
    logger.info("Orçamentos encontrados: %s", orcamentos_formatados)
    return padronizar_resposta(200, orcamentos_formatados)

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

def buscar_cliente(body):
    cpf = body.get('cpf')
    logger.info("Buscando cliente com CPF: %s", cpf)
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

def cadastrar_veiculo(body):
    logger.info("Iniciando cadastro do veículo: %s", body.get('placa'))
    
    # Verifica se a placa já está cadastrada
    if collection_veiculo.find_one({'placa': body.get('placa')}):
        logger.warning("Cadastro falhou: Placa %s já existe.", body.get('placa'))
        return padronizar_resposta(400, 'Placa já existe.')
    
    # Verifica se o CPF do cliente existe
    if not collection_cliente.find_one({'cpf': body.get('cpfCliente')}):
        logger.warning("Cadastro falhou: CPF do cliente %s não encontrado.", body.get('cpfCliente'))
        return padronizar_resposta(400, 'CPF do cliente não encontrado.')
    
    # Verifica se os campos obrigatórios estão presentes
    if not validar_campos_obrigatorios({'placa': body.get('placa'), 'cpfCliente': body.get('cpfCliente'), 'fotos': body.get('fotos')}):
        return padronizar_resposta(400, 'Placa, CPF do cliente e fotos são obrigatórios.')
    
    # Cria um novo dicionário com apenas os campos desejados
    cadastro_veiculo = {
        'placa': body.get('placa'),
        'cpf_cliente': body.get('cpfCliente'),  # Use a chave que você deseja no banco
        'fotos': body.get('fotos')  # Adiciona o novo campo de fotos
    }
    
    # Insere apenas o objeto com os campos desejados
    collection_veiculo.insert_one(cadastro_veiculo)
    logger.info("Veículo cadastrado com sucesso: %s", cadastro_veiculo)
    return padronizar_resposta(201, 'Veículo cadastrado com sucesso!')

def buscar_veiculo(body):
    placa = body.get('placa')
    logger.info("Buscando veículo com placa: %s", placa)
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

def buscar_clientes_e_veiculos(body):
    logger.info("Buscando clientes e veículos.")
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
    
def lambda_handler(event, context):
    logger.info("Recebendo evento: %s", event)
    
    # Verifica se 'routeKey' está presente
    if 'routeKey' not in event:
        logger.warning("Evento não contém routeKey.")
        return padronizar_resposta(400, 'O evento não contém routeKey.')

    # Tenta processar o corpo do evento
    try:
        body = json.loads(event['body'])
    except (KeyError, json.JSONDecodeError) as e:
        logger.warning("Erro ao processar o corpo do evento: %s", str(e))
        return padronizar_resposta(400, 'Corpo do evento inválido.')

    action = body.get('action')
    logger.info("Ação recebida: %s", action)

    acoes = {
        'cadastrar_cliente': cadastrar_cliente,
        'buscar_cliente': buscar_cliente,
        'cadastrar_veiculo': cadastrar_veiculo,
        'buscar_veiculo': buscar_veiculo,
        'buscar_clientes_e_veiculos': buscar_clientes_e_veiculos,
        'cadastrar_orcamento': cadastrar_orcamento,
        'buscar_orcamentos': buscar_orcamentos,
        'buscar_orcamento_detalhes': buscar_orcamento_detalhes
    }

    if action in acoes:
        resposta = acoes[action](body)
    else:
        logger.warning("Ação não reconhecida ou método não permitido.")
        resposta = padronizar_resposta(400, 'Ação não reconhecida ou método não permitido.')

    # Logando a resposta final
    logger.info("Resposta final: %s", resposta)
    return resposta