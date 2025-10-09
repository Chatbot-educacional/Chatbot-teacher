import { Mail, BookOpen, Download, FileText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { mockStudentAnalytics, mockSubjects } from "@/data/mockData";

export function ActionButtons() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [emailData, setEmailData] = useState({
    to: "",
    subject: "",
    message: "",
  });

  const handleSendMessage = () => {
    setShowForm(!showForm);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEmailData({ ...emailData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Mensagem pronta para envio!",
      description: `E-mail para ${emailData.to} com assunto "${emailData.subject}"`,
    });
    setShowForm(false);
    setEmailData({ to: "", subject: "", message: "" });
  };

  const handleSuggestRevision = () => {
    console.log("Sugerindo revisão de conteúdo...");
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text('Relatório de Desempenho dos Estudantes', 14, 22);
      doc.setFontSize(12);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 35);

      const tableData = mockStudentAnalytics.map(student => [
        student.name,
        `${student.overallAccuracy}%`,
        student.totalTime,
        student.forumInteractions.totalParticipations.toString(),
        student.difficultTopics.join(', ')
      ]);

      autoTable(doc, {
        head: [['Nome', 'Precisão Geral', 'Tempo Total', 'Participações Fórum', 'Tópicos Difíceis']],
        body: tableData,
        startY: 45,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [102, 51, 153], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      let currentY = (doc as any).lastAutoTable.finalY + 20;
      doc.setFontSize(14);
      doc.text('Resumo por Matéria', 14, currentY);

      const subjectSummary = mockSubjects
        .filter(subject => subject.id !== 'all')
        .map(subject => {
          const performances = mockStudentAnalytics.flatMap(student => 
            student.subjectPerformances.filter(perf => perf.subjectId === subject.id)
          );
          const avgAccuracy = performances.reduce((sum, perf) => sum + perf.accuracy, 0) / performances.length;
          return [subject.name, `${Math.round(avgAccuracy)}%`, performances.length.toString()];
        });

      autoTable(doc, {
        head: [['Matéria', 'Precisão Média', 'Total de Estudantes']],
        body: subjectSummary,
        startY: currentY + 10,
        styles: { fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: [102, 51, 153], textColor: [255, 255, 255] },
      });

      doc.save('relatorio-estudantes.pdf');
      toast({ title: "PDF Exportado", description: "Relatório em PDF foi gerado com sucesso!" });
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Erro ao gerar o relatório em PDF.", variant: "destructive" });
    }
  };

  const handleExportExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();
      const studentsData = mockStudentAnalytics.map(student => ({
        'Nome': student.name,
        'Precisão Geral (%)': student.overallAccuracy,
        'Tempo Total': student.totalTime,
        'Questões no Fórum': student.forumInteractions.questionsAsked,
        'Respostas no Fórum': student.forumInteractions.answersGiven,
        'Total Participações': student.forumInteractions.totalParticipations,
        'Tópicos Difíceis': student.difficultTopics.join(', '),
        'Última Atividade': student.lastActivity
      }));
      
      const studentsSheet = XLSX.utils.json_to_sheet(studentsData);
      XLSX.utils.book_append_sheet(workbook, studentsSheet, 'Estudantes');

      const subjectPerformanceData: any[] = [];
      mockStudentAnalytics.forEach(student => {
        student.subjectPerformances.forEach(perf => {
          subjectPerformanceData.push({
            'Estudante': student.name,
            'Matéria': perf.subjectName,
            'Precisão (%)': perf.accuracy,
            'Total Questões': perf.totalQuestions,
            'Respostas Corretas': perf.correctAnswers,
            'Tempo Gasto': perf.totalTime
          });
        });
      });
      
      const subjectSheet = XLSX.utils.json_to_sheet(subjectPerformanceData);
      XLSX.utils.book_append_sheet(workbook, subjectSheet, 'Por Matéria');

      const levelAnalysisData: any[] = [];
      mockStudentAnalytics.forEach(student => {
        student.subjectPerformances.forEach(perf => {
          perf.questionLevels.forEach(level => {
            levelAnalysisData.push({
              'Estudante': student.name,
              'Matéria': perf.subjectName,
              'Nível': level.level,
              'Corretas': level.correct,
              'Incorretas': level.incorrect,
              'Total': level.total,
              'Precisão (%)': Math.round((level.correct / level.total) * 100)
            });
          });
        });
      });
      
      const levelSheet = XLSX.utils.json_to_sheet(levelAnalysisData);
      XLSX.utils.book_append_sheet(workbook, levelSheet, 'Por Nível');

      XLSX.writeFile(workbook, 'relatorio-estudantes.xlsx');
      toast({ title: "Excel Exportado", description: "Planilha foi gerada com sucesso!" });
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Erro ao gerar a planilha Excel.", variant: "destructive" });
    }
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

        {/* Formulário de envio de e-mail */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-6 p-4 border rounded-xl bg-accent/30 flex flex-col gap-3"
          >
            <h3 className="text-md font-semibold text-primary">Nova Mensagem</h3>
            <Input
              type="email"
              name="to"
              placeholder="E-mail do aluno"
              value={emailData.to}
              onChange={handleChange}
              required
            />
            <Input
              type="text"
              name="subject"
              placeholder="Título do e-mail"
              value={emailData.subject}
              onChange={handleChange}
              required
            />
            <Textarea
              name="message"
              placeholder="Escreva sua mensagem..."
              value={emailData.message}
              onChange={handleChange}
              required
            />
            <div className="flex justify-end">
              <Button type="submit" className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Enviar
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
