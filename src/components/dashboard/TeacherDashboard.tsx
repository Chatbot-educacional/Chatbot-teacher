import { useState } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { SummaryCards } from "./SummaryCards";
import { PerformanceChart } from "./PerformanceChart";
import { EnhancedStudentsTable } from "./EnhancedStudentsTable";
import { DifficultTopics } from "./DifficultTopics";
import { EnhancedStudentDetails } from "./EnhancedStudentDetails";
import { ChatPanel } from "./ChatPanel";
import { ActionButtons } from "./ActionButtons";
import { AnnouncementsPanel } from "./AnnouncementsPanel";
import { ClassSelector } from "./ClassSelector";
import { SubjectFilter } from "./SubjectFilter";
import { mockClasses, mockSubjects, mockStudentAnalytics } from "@/data/mockData";
import { FilterOptions, StudentAnalytics } from "@/types/dashboard";

export function TeacherDashboard() {
  const [selectedStudent, setSelectedStudent] = useState<StudentAnalytics | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    selectedClass: "all",
    selectedSubject: "all",
    sortBy: "accuracy",
    sortOrder: "desc"
  });

  const handleStudentClick = (student: StudentAnalytics) => {
    setSelectedStudent(student);
  };

  const handleCloseDetails = () => {
    setSelectedStudent(null);
  };

  const handleClassChange = (classId: string) => {
    setFilters(prev => ({ ...prev, selectedClass: classId }));
  };

  const handleSubjectChange = (subjectId: string) => {
    setFilters(prev => ({ ...prev, selectedSubject: subjectId }));
  };

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({ ...prev, sortBy: sortBy as FilterOptions['sortBy'] }));
  };

  const handleSortOrderToggle = () => {
    setFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === 'desc' ? 'asc' : 'desc' }));
  };

  // Filter students based on selected class and subject
  const filteredStudents = mockStudentAnalytics
    .filter(student => {
      if (filters.selectedClass === "all") return true;
      return student.classId === filters.selectedClass;
    })
    .sort((a, b) => {
      let valueA: number, valueB: number;
      
      switch (filters.sortBy) {
        case 'accuracy':
          if (filters.selectedSubject === "all") {
            valueA = a.overallAccuracy;
            valueB = b.overallAccuracy;
          } else {
            const perfA = a.subjectPerformances.find(p => p.subjectId === filters.selectedSubject);
            const perfB = b.subjectPerformances.find(p => p.subjectId === filters.selectedSubject);
            valueA = perfA?.accuracy || 0;
            valueB = perfB?.accuracy || 0;
          }
          break;
        case 'participation':
          valueA = a.forumInteractions.totalParticipations;
          valueB = b.forumInteractions.totalParticipations;
          break;
        case 'difficulty':
          valueA = a.difficultTopics.length;
          valueB = b.difficultTopics.length;
          break;
        case 'time':
          // Convert time string to minutes for sorting
          const timeToMinutes = (timeStr: string) => {
            const parts = timeStr.match(/(\d+)h\s*(\d+)m/);
            return parts ? parseInt(parts[1]) * 60 + parseInt(parts[2]) : 0;
          };
          
          if (filters.selectedSubject === "all") {
            valueA = timeToMinutes(a.totalTime);
            valueB = timeToMinutes(b.totalTime);
          } else {
            const perfA = a.subjectPerformances.find(p => p.subjectId === filters.selectedSubject);
            const perfB = b.subjectPerformances.find(p => p.subjectId === filters.selectedSubject);
            valueA = timeToMinutes(perfA?.totalTime || "0h 0m");
            valueB = timeToMinutes(perfB?.totalTime || "0h 0m");
          }
          break;
        default:
          valueA = a.overallAccuracy;
          valueB = b.overallAccuracy;
      }
      
      return filters.sortOrder === 'desc' ? valueB - valueA : valueA - valueB;
    });

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Fixed Header */}
      <div className="sticky top-0 z-40">
        <DashboardHeader />
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Class and Subject Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ClassSelector 
            classes={mockClasses}
            selectedClass={filters.selectedClass}
            onClassChange={handleClassChange}
          />
          <SubjectFilter 
            subjects={mockSubjects}
            selectedSubject={filters.selectedSubject}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onSubjectChange={handleSubjectChange}
            onSortChange={handleSortChange}
            onSortOrderToggle={handleSortOrderToggle}
          />
        </div>

        {/* Summary Cards */}
        <SummaryCards 
          students={filteredStudents}
          selectedSubject={filters.selectedSubject}
          subjects={mockSubjects}
        />

        {/* Charts and Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Chart - Takes 2 columns */}
          <div className="lg:col-span-2">
            <PerformanceChart 
              students={filteredStudents}
              selectedSubject={filters.selectedSubject}
              subjects={mockSubjects}
            />
          </div>
          
          {/* Difficult Topics - Takes 1 column */}
          <div className="lg:col-span-1">
            <DifficultTopics 
              students={filteredStudents}
              selectedSubject={filters.selectedSubject}
              subjects={mockSubjects}
            />
          </div>
        </div>

        {/* Enhanced Students Table */}
        <EnhancedStudentsTable 
          students={filteredStudents}
          subjects={mockSubjects}
          selectedSubject={filters.selectedSubject}
          onStudentClick={handleStudentClick}
        />

        {/* Announcements Panel */}
        <AnnouncementsPanel />

        {/* Bottom Row - Chat and Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChatPanel />
          <ActionButtons />
        </div>
      </div>

      {/* Enhanced Student Details Modal */}
      {selectedStudent && (
        <EnhancedStudentDetails 
          student={selectedStudent}
          subjects={mockSubjects}
          onClose={handleCloseDetails} 
        />
      )}
    </div>
  );
}