export const formatarDataPorExtenso = (data: Date): string => {
  const meses = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  
  const dia = data.getDate();
  const mes = meses[data.getMonth()];
  const ano = data.getFullYear();
  
  return `${dia} de ${mes} de ${ano}`;
};

export const documentoIdentificacao = {
  tipoDocumento: '',
  numeroDocumento: '',
  dataExpedicao: '',
  naturalidade: '',
  orgaoExpedidor: '',
  dataNascimento: '',
  filiacao: '',
  nomeCompleto: '',
  cpf: '',
  profissao: ''
};

export const pessoaFields = {
  ...documentoIdentificacao,
  endereco: '',
  telefone: '',
  whatsapp: ''
};

export const documentTypes = {
  recibo: {
    title: 'Recibo',
    fields: {
      emitente: {
        ...pessoaFields,
        dadosBancarios: {
          banco: '',
          agencia: '',
          conta: '',
          tipoConta: ''
        }
      },
      pagador: {
        ...pessoaFields
      },
      pagamento: {
        valor: '',
        valorPorExtenso: '',
        formaPagamento: '',
        referenteA: '',
        numeroRecibo: '',
        local: '',
        dataPorExtenso: '',
        usarDataSistema: false
      }
    }
  },
  contratoLocacao: {
    title: 'Contrato de Locação',
    fields: {
      locador: {
        ...pessoaFields,
        conjugeLocador: { ...pessoaFields }
      },
      locatario: {
        ...pessoaFields,
        conjugeLocatario: { ...pessoaFields }
      },
      imovel: {
        endereco: '',
        cep: '',
        valor: '',
        prazo: '',
        dataInicio: '',
        dataFim: ''
      },
      testemunhas: [
        { ...pessoaFields },
        { ...pessoaFields }
      ],
      local: '',
      dataPorExtenso: '',
      usarDataSistema: false
    }
  },
  contratoVenda: {
    title: 'Contrato de Venda',
    fields: {
      vendedor: {
        ...pessoaFields,
        conjugeVendedor: { ...pessoaFields }
      },
      comprador: {
        ...pessoaFields,
        conjugeComprador: { ...pessoaFields }
      },
      imovel: {
        endereco: '',
        cep: '',
        matricula: '',
        valor: '',
        valorPorExtenso: '',
        formaPagamento: '',
        registroImovel: '',
        areaTotal: '',
        areaConstructed: '',
        inscricaoMunicipal: ''
      },
      testemunhas: [
        { ...pessoaFields },
        { ...pessoaFields }
      ],
      local: '',
      dataPorExtenso: '',
      usarDataSistema: false
    }
  }
};