<Card className="max-w-md w-full mx-auto">
  <div className="p-6">
    <div className="grid gap-4">
      {/* Outros campos... */}
      
      {email && (
        <div className="flex items-start gap-2 max-w-full"> {/* Alterado items-center para items-start e adicionado max-w-full */}
          <Mail className="h-4 w-4 text-gray-500 flex-shrink-0 mt-1" /> {/* Adicionado mt-1 para alinhar com o texto */}
          <div className="flex-1 min-w-0"> {/* Novo div container para o texto */}
            <span className="text-sm text-gray-600 break-words w-full inline-block">
              {email}
            </span>
          </div>
        </div>
      )}
      
      {/* Outros campos... */}
    </div>
  </div>
</Card>
