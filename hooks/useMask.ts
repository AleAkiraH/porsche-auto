export const useMask = () => {
  const maskCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')
  }

  const maskPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 10) {
      return cleaned
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1')
    }
    return cleaned
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1')
  }

  const maskPlaca = (value: string) => {
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    if (cleaned.length === 7) {
      // Formato antigo: AAA-9999
      if (/^[A-Z]{3}\d{4}$/.test(cleaned)) {
        return cleaned.replace(/(\w{3})(\w{4})/, '$1-$2')
      }
      // Formato Mercosul: AAA0A00
      return cleaned.replace(/(\w{3})(\d)(\w)(\d{2})/, '$1$2$3$4')
    }
    return cleaned
  }

  return { maskCPF, maskPhone, maskPlaca }
}
