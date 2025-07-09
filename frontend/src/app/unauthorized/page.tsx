export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Acesso Negado
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Seu email não está autorizado a acessar este sistema.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Se você acredita que deveria ter acesso, entre em contato com o administrador.
          </p>
        </div>
        
        <div className="mt-8">
          <a
            href="/login"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Voltar para login
          </a>
        </div>
      </div>
    </div>
  );
}