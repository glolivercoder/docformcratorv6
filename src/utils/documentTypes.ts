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

export const pessoaFields = {
  nome: '',
  profissao: '',
  rg: '',
  cpf: '',
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
  },
  peticaoInicial: {
    title: 'Petição Inicial',
    fields: {
      autor: {
        ...pessoaFields
      },
      reu: {
        ...pessoaFields
      },
      processo: {
        vara: '',
        comarca: '',
        assunto: '',
        valorCausa: '',
        valorCausaPorExtenso: '',
        fatos: '',
        fundamentacao: '',
        pedidos: '',
        provas: ''
      },
      advogado: {
        ...pessoaFields,
        oab: '',
        estadoOAB: ''
      },
      local: '',
      dataPorExtenso: '',
      usarDataSistema: false
    }
  },
  procuracao: {
    title: 'Procuração',
    fields: {
      outorgante: {
        ...pessoaFields,
        estadoCivil: '',
        nacionalidade: ''
      },
      outorgado: {
        ...pessoaFields,
        estadoCivil: '',
        nacionalidade: ''
      },
      poderes: {
        poderesEspecificos: '',
        finalidade: '',
        prazoValidade: '',
        substabelecimento: ''
      },
      local: '',
      dataPorExtenso: '',
      usarDataSistema: false
    }
  }
};