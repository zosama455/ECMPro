import React, { useState, useEffect } from 'react';
import { X, Upload, FolderOpen, ShieldAlert, FileText, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Folder } from '../types';

type ConfidentialityLevel = 'public' | 'internal' | 'confidential' | 'restricted' | 'secret' | 'top_secret';

interface DocumentType {
  id: string;
  name: string;
  department_id: string;
  document_main_type: string;
}

interface EnhancedUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    confidentiality: ConfidentialityLevel;
    documentTypeId: string;
    documentTypeName: string;
  }) => void;
  fileName: string;
  departmentId: string;
  currentFolder: Folder | null;
  breadcrumbs: Folder[];
}

export function EnhancedUploadDialog({
  isOpen,
  onClose,
  onConfirm,
  fileName,
  departmentId,
  currentFolder,
  breadcrumbs,
}: EnhancedUploadDialogProps) {
  const [selectedConfidentiality, setSelectedConfidentiality] = useState<ConfidentialityLevel>('internal');
  const [selectedDocType, setSelectedDocType] = useState('');
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && departmentId) {
      loadDocumentTypes();
    }
  }, [isOpen, departmentId]);

  const loadDocumentTypes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('document_types')
        .select('id, name, department_id, document_main_type')
        .eq('department_id', departmentId)
        .order('name', { ascending: true });

      if (error) throw error;
      setDocumentTypes(data || []);
    } catch (error) {
      console.error('Error loading document types:', error);
      setDocumentTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedDocTypeName = () => {
    const docType = documentTypes.find(dt => dt.id === selectedDocType);
    return docType?.name || '[Select Document Type]';
  };

  const getCurrentPath = () => {
    const parts = breadcrumbs.map(b => b.name);
    if (currentFolder && !breadcrumbs.find(b => b.id === currentFolder.id)) {
      parts.push(currentFolder.name);
    }
    return parts.join(' > ');
  };

  const getResolvedPath = () => {
    const currentPath = getCurrentPath();
    return selectedDocType
      ? `${currentPath} > ${getSelectedDocTypeName()}`
      : `${currentPath} > [Select Document Type]`;
  };

  const handleConfirm = () => {
    if (!selectedDocType) return;

    onConfirm({
      confidentiality: selectedConfidentiality,
      documentTypeId: selectedDocType,
      documentTypeName: getSelectedDocTypeName(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Upload Document</h2>
              <p className="text-sm text-gray-500">{getCurrentPath() || 'My Files'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-2">Selected File:</p>
                <div className="bg-white px-3 py-2 rounded border border-gray-200">
                  <p className="text-sm text-gray-900 font-medium truncate">{fileName}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Confidentiality Level
                <span className="text-red-500">*</span>
              </div>
            </label>
            <select
              value={selectedConfidentiality}
              onChange={(e) => setSelectedConfidentiality(e.target.value as ConfidentialityLevel)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            >
              <option value="public">Public</option>
              <option value="internal">Internal</option>
              <option value="confidential">Confidential</option>
              <option value="restricted">Restricted</option>
              <option value="secret">Secret</option>
              <option value="top_secret">Top Secret</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Select the appropriate confidentiality level for this document
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Document Type
                <span className="text-red-500">*</span>
              </div>
            </label>
            {loading ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-500">
                Loading document types...
              </div>
            ) : documentTypes.length === 0 ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-500">
                No document types available for this department
              </div>
            ) : (
              <>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  <option value="">Select a Document Type...</option>
                  {documentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.document_main_type})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Document types available in the current department
                </p>
              </>
            )}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FolderOpen className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Document will be stored in:
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-900 font-medium bg-white px-3 py-2 rounded border border-gray-200 flex-wrap">
                  {getResolvedPath().split(' > ').map((part, index, array) => (
                    <React.Fragment key={index}>
                      <span className={index === array.length - 1 && selectedDocType ? 'text-emerald-600' : ''}>
                        {part}
                      </span>
                      {index < array.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleConfirm}
              disabled={!selectedDocType || loading}
              className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
