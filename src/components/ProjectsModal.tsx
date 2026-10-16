import React, { useRef } from 'react';
import { SavedProjectItem, NewsProject } from '../types';
import { X, FolderOpen, Trash2, Copy, Download, Upload, Clock, Plus } from 'lucide-react';
import { Language, TRANSLATIONS } from '../utils/translations';

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: SavedProjectItem[];
  onSelectProject: (project: NewsProject) => void;
  onDeleteProject: (id: string) => void;
  onNewProject: () => void;
  onImportProject: (imported: NewsProject) => void;
  language?: Language;
}

export const ProjectsModal: React.FC<ProjectsModalProps> = ({
  isOpen,
  onClose,
  projects,
  onSelectProject,
  onDeleteProject,
  onNewProject,
  onImportProject,
  language = 'ne'
}) => {
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[language];

  if (!isOpen) return null;

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.headline !== undefined || parsed.templateStyle !== undefined) {
          onImportProject(parsed);
          onClose();
        } else {
          alert('अमान्य फाइल ढाँचा (Invalid Project File)');
        }
      } catch (err) {
        alert('फाइल पढ्न सकिएन (Failed to read JSON)');
      }
    };
    reader.readAsText(file);
  };

  const handleExportJson = (project: NewsProject, e: React.MouseEvent) => {
    e.stopPropagation();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.title || 'samachar-project'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-red-500" />
            <div>
              <h2 className="text-base font-bold text-white">{t.savedProjectsTitle}</h2>
              <p className="text-xs text-slate-400">{t.savedProjectsSub}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-800/40 border-b border-slate-800 text-xs">
          <button
            onClick={() => {
              onNewProject();
              onClose();
            }}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newCard}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => jsonInputRef.current?.click()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.importJson}</span>
            </button>
            <input
              ref={jsonInputRef}
              type="file"
              accept=".json"
              onChange={handleJsonUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* List of projects */}
        <div className="flex-1 overflow-y-auto p-6">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto mb-3 text-slate-500">
                <FolderOpen className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium text-slate-300">हाल कुनै सुरक्षित प्रोजेक्ट छैन</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                तपाईंले कुनै न्युज कार्ड तयार पारेपछि माथिको &quot;प्रोजेक्ट सुरक्षित गर्नुहोस्&quot; बटन थिचेर सुरक्षित गर्न सक्नुहुन्छ।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectProject(item.data);
                    onClose();
                  }}
                  className="group relative p-4 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-800/40 hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                        {item.title}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 shrink-0 uppercase">
                        {item.data.aspectRatio}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 font-mukta">
                      {item.data.headline || item.data.bodyText || 'Empty Project'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/60 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        title="Download JSON backup"
                        onClick={(e) => handleExportJson(item.data, e)}
                        className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Delete project"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('के तपाईं यो प्रोजेक्ट मेटाउन चाहनुहुन्छ?')) {
                            onDeleteProject(item.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-slate-700 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
