import { Mail, BookOpen, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ActionButtons() {
  const handleSendMessage = () => {
    console.log("Enviando mensagem para alunos...");
  };

  const handleSuggestRevision = () => {
    console.log("Sugerindo revisão de conteúdo...");
  };

  const handleExportPDF = () => {
    console.log("Exportando relatório em PDF...");
  };

  const handleExportExcel = () => {
    console.log("Exportando relatório em Excel...");
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button 
            onClick={handleSendMessage}
            className="flex items-center gap-2 h-auto py-3"
          >
            <Mail className="h-4 w-4" />
            <div className="text-left">
              <div className="font-medium">Enviar Mensagem</div>
              <div className="text-xs opacity-80">Para todos os alunos</div>
            </div>
          </Button>

          <Button 
            onClick={handleSuggestRevision}
            variant="outline"
            className="flex items-center gap-2 h-auto py-3"
          >
            <BookOpen className="h-4 w-4" />
            <div className="text-left">
              <div className="font-medium">Sugerir Revisão</div>
              <div className="text-xs opacity-80">Conteúdo específico</div>
            </div>
          </Button>

          <Button 
            onClick={handleExportPDF}
            variant="outline"
            className="flex items-center gap-2 h-auto py-3"
          >
            <FileText className="h-4 w-4" />
            <div className="text-left">
              <div className="font-medium">Exportar PDF</div>
              <div className="text-xs opacity-80">Relatório completo</div>
            </div>
          </Button>

          <Button 
            onClick={handleExportExcel}
            variant="outline"
            className="flex items-center gap-2 h-auto py-3"
          >
            <Download className="h-4 w-4" />
            <div className="text-left">
              <div className="font-medium">Exportar Excel</div>
              <div className="text-xs opacity-80">Planilha de dados</div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}