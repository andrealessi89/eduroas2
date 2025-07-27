import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  X, 
  ShoppingCart, 
  Package, 
  DollarSign, 
  Truck, 
  AlertCircle, 
  CheckCircle,
  RotateCcw,
  Tag,
  User,
  Mail,
  CreditCard,
  Calendar,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Pedido } from '@/hooks/usePedidos';

interface PedidoModalProps {
  pedido: Pedido;
  isOpen: boolean;
  onClose: () => void;
  onReprocessar: () => void;
}

export default function PedidoModal({ pedido, isOpen, onClose, onReprocessar }: PedidoModalProps) {
  const getMargemColor = (margem: number) => {
    if (margem < 20) return "text-red-600 bg-red-50";
    if (margem < 30) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const getSituacaoBadge = (situacao: number, descricao: string) => {
    const badges: Record<number, { color: string; icon: any }> = {
      4: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      3: { color: "bg-yellow-100 text-yellow-800", icon: Calendar },
      5: { color: "bg-blue-100 text-blue-800", icon: Package },
    };

    const badge = badges[situacao] || { color: "bg-gray-100 text-gray-800", icon: AlertCircle };
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="w-4 h-4 mr-2" />
        {descricao}
      </span>
    );
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Detalhes do Pedido #{pedido.codigo}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {format(new Date(pedido.dataHora), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Fechar</span>
                    <X className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                <div className="mt-6 space-y-6">
                  {/* Status e Alertas */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getSituacaoBadge(pedido.situacao, pedido.situacaoDescricao)}
                      {pedido.statusProcessamento.temErros && (
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            {pedido.statusProcessamento.produtosSemCusto.length} produto(s) sem custo
                          </span>
                          <button
                            onClick={onReprocessar}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reprocessar Custos
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Informações do Cliente */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Informações do Cliente</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{pedido.pessoaNome}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{pedido.pessoaEmail}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{pedido.formaPagamento}</span>
                      </div>
                    </div>
                  </div>

                  {/* Resumo Financeiro */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Valor Total</p>
                          <p className="mt-1 text-xl font-bold text-gray-900">
                            {formatCurrency(pedido.valorTotal)}
                          </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Custo Total</p>
                          <p className="mt-1 text-xl font-bold text-gray-900">
                            {formatCurrency(pedido.statusProcessamento.custoTotal)}
                          </p>
                        </div>
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Lucro</p>
                          <p className="mt-1 text-xl font-bold text-gray-900">
                            {formatCurrency(pedido.statusProcessamento.lucroTotal)}
                          </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-500" />
                      </div>
                    </div>

                    <div className={`rounded-lg p-4 ${getMargemColor(pedido.statusProcessamento.margemLucro)}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Margem de Lucro</p>
                          <p className="mt-1 text-xl font-bold">
                            {pedido.statusProcessamento.margemLucro.toFixed(1)}%
                          </p>
                        </div>
                        {pedido.statusProcessamento.margemLucro >= 30 ? (
                          <TrendingUp className="h-8 w-8" />
                        ) : (
                          <TrendingDown className="h-8 w-8" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detalhamento de Valores */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Detalhamento de Valores</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal Produtos</span>
                        <span className="font-medium">{formatCurrency(pedido.valorProduto)}</span>
                      </div>
                      {pedido.valorDesconto > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Descontos</span>
                          <span className="font-medium text-red-600">-{formatCurrency(pedido.valorDesconto)}</span>
                        </div>
                      )}
                      {pedido.cupomCodigo && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 flex items-center">
                            <Tag className="h-3 w-3 mr-1" />
                            Cupom ({pedido.cupomCodigo})
                          </span>
                          <span className="font-medium text-red-600">-{formatCurrency(pedido.cupomDesconto)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 flex items-center">
                          <Truck className="h-3 w-3 mr-1" />
                          Frete
                        </span>
                        <span className="font-medium">{formatCurrency(pedido.valorFrete)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="font-medium text-gray-900">Total</span>
                        <span className="font-bold text-gray-900">{formatCurrency(pedido.valorTotal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Produtos */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Produtos do Pedido</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Produto
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Qtd
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Preço Unit.
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Custo Unit.
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Lucro Item
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {pedido.itens.map((item) => {
                            const margemItem = item.valorItem > 0 ? (item.lucroItem / item.valorItem) * 100 : 0;
                            const semCusto = item.custoUnitario === 0;
                            
                            return (
                              <tr key={item.id} className={semCusto ? 'bg-red-50' : ''}>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {item.produtoNome}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      SKU: {item.produtoDerivacaoCodigo}
                                    </div>
                                    {semCusto && (
                                      <div className="text-xs text-red-600 font-medium mt-1">
                                        <AlertCircle className="h-3 w-3 inline mr-1" />
                                        Produto sem custo cadastrado
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900">
                                  {item.quantidade}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                                  {formatCurrency(item.valorUnitario)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                                  {semCusto ? (
                                    <span className="text-red-600 font-medium">-</span>
                                  ) : (
                                    formatCurrency(item.custoUnitario)
                                  )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                                  <div>
                                    <div className={`font-medium ${item.lucroItem >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {formatCurrency(item.lucroItem)}
                                    </div>
                                    {!semCusto && (
                                      <div className={`text-xs ${getMargemColor(margemItem).split(' ')[0]}`}>
                                        {margemItem.toFixed(1)}%
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                  {formatCurrency(item.valorItem)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Produtos sem custo */}
                  {pedido.statusProcessamento.temErros && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-red-800">
                            Atenção: Produtos sem custo cadastrado
                          </h4>
                          <p className="mt-1 text-sm text-red-700">
                            Os seguintes produtos não possuem custo cadastrado no sistema:
                          </p>
                          <ul className="mt-2 space-y-1">
                            {pedido.statusProcessamento.produtosSemCusto.map((produto, index) => (
                              <li key={index} className="text-sm text-red-600">
                                • {produto.nome} (SKU: {produto.codigo}) - Quantidade: {produto.quantidade}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-3 text-sm text-red-700">
                            Clique em "Reprocessar Custos" após cadastrar os custos destes produtos.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    Fechar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}