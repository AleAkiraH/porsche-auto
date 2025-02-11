export function useMask() {
  const maskPlaca = (value: string) => {
    return value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .replace(/(\w{3})(\w)/, '$1-$2')
      .substring(0, 8)
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
    maskPlaca,
    maskCPF,
    maskPhone // Alterado de maskTelefone para maskPhone
  }
}
