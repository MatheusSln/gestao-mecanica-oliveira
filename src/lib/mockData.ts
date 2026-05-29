export const useMockData = () => {
  const getFaturamento = () => 4580.00;
  const getComissoes = () => 1250.00;
  
  const getOrdensServico = () => [
    { 
      id: '1001', 
      carro: 'Gol G5 1.0', 
      placa: 'ABC-1234',
      cliente: 'João Silva', 
      telefone: '(31) 98888-1111',
      valor: 850.00, 
      status: 'Fechada', 
      mecanico: 'Marcos',
      pecas: [
        { nome: 'Óleo de Motor 5w30 Sintético (Mobil)', qtd: 4, precoVenda: 45.00 },
        { nome: 'Filtro de Ar (Tecfil)', qtd: 1, precoVenda: 35.00 },
        { nome: 'Peça Avulsa: Jogo de Velas NGK (Comprado na Autopeças)', qtd: 1, precoVenda: 120.00 }
      ],
      maoObra: 515.00,
      data: '24/04/2026'
    },
    { 
      id: '1002', 
      carro: 'Civic 2018 2.0', 
      placa: 'XYZ-9876',
      cliente: 'Maria Souza', 
      telefone: '(31) 97777-2222',
      valor: 1200.00, 
      status: 'Fechada', 
      mecanico: 'Pedro',
      pecas: [
        { nome: 'Pastilha de Freio Dianteira (Cobreq)', qtd: 1, precoVenda: 280.00 },
        { nome: 'Disco de Freio Dianteiro (Fremax)', qtd: 2, precoVenda: 180.00 }
      ],
      maoObra: 560.00,
      data: '25/04/2026'
    },
    { 
      id: '1003', 
      carro: 'Hilux 2.8 Diesel', 
      placa: 'HIL-0001',
      cliente: 'Carlos', 
      telefone: '(31) 96666-3333',
      valor: 450.00, 
      status: 'Em Aberto', 
      mecanico: 'Marcos',
      pecas: [],
      maoObra: 450.00,
      data: '27/04/2026'
    },
  ];

  const getOrdemById = (id: string) => {
    return getOrdensServico().find(os => os.id === id);
  }

  const getEstoque = () => [
    { id: '1', nome: 'Óleo 5W30 Sintético', marca: 'Mobil', codigo: 'MO-5W30', categoria: 'Lubrificantes', compatibilidade: 'Universal', quantidade: 12, precoVenda: 45.00 },
    { id: '2', nome: 'Óleo 15W40 Semissintético', marca: 'Castrol', codigo: 'CA-15W40', categoria: 'Lubrificantes', compatibilidade: 'Universal', quantidade: 8, precoVenda: 38.00 },
    { id: '3', nome: 'Filtro de Óleo', marca: 'Tecfil', codigo: 'PSL55', categoria: 'Filtros', compatibilidade: 'VW Motor EA111/EA211', quantidade: 15, precoVenda: 25.00 },
    { id: '4', nome: 'Filtro de Ar', marca: 'Mann', codigo: 'C2998', categoria: 'Filtros', compatibilidade: 'Honda Civic 17+', quantidade: 4, precoVenda: 65.00 },
    { id: '5', nome: 'Pastilha de Freio Dianteira', marca: 'Cobreq', codigo: 'N-1502', categoria: 'Freios', compatibilidade: 'Honda Civic 17+', quantidade: 2, precoVenda: 280.00 },
    { id: '6', nome: 'Pastilha de Freio Dianteira', marca: 'Fras-le', codigo: 'PD/371', categoria: 'Freios', compatibilidade: 'VW Gol/Voyage G5', quantidade: 6, precoVenda: 110.00 },
    { id: '7', nome: 'Correia Dentada', marca: 'Dayco', codigo: '135SP254H', categoria: 'Motor', compatibilidade: 'VW Motor EA111', quantidade: 3, precoVenda: 145.00 },
    { id: '8', nome: 'Amortecedor Dianteiro', marca: 'Monroe', codigo: 'SP041', categoria: 'Suspensão', compatibilidade: 'GM Onix 13-19', quantidade: 0, precoVenda: 350.00 },
  ];

  const getEquipe = () => [
    { id: 'm1', nome: 'Marcos (Mecânico Sênior)', comissaoSemana: 850.00, carrosAtendidos: 4, comissaoTipo: 'percentual', comissaoValor: 40 },
    { id: 'm2', nome: 'Pedro (Auxiliar)', comissaoSemana: 400.00, carrosAtendidos: 2, comissaoTipo: 'percentual', comissaoValor: 25 },
  ];

  return { getFaturamento, getComissoes, getOrdensServico, getOrdemById, getEstoque, getEquipe };
};