export const useMask = () => {
  const maskPlaca = (value: string) => {
    // Remove qualquer caractere que não seja letra ou número
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '');
    // Limita a 7 caracteres e converte para maiúsculo
    return cleaned.toUpperCase().slice(0, 7);
  }

  const maskCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')
  }

  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4,5})(\d{4})/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1')
  }

  return { 
    maskCPF,
    maskPhone,
    maskPlaca,
  }
}
