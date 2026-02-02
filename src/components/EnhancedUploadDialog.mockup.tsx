import React, { useState } from 'react';
import { X, Upload, FolderOpen, ShieldAlert, FileText, CheckCircle, ArrowRight } from 'lucide-react';

export function EnhancedUploadDialogMockup() {
  const [showUploadDialog, setShowUploadDialog] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const mockCurrentPath = "HR > Category-1 > Sub-category-1";
  const mockDocumentTypes = [
    "Document Type 1",
    "Document Type 2",
    "Document Type 3"
  ];
  const [selectedConfidentiality, setSelectedConfidentiality] = useState("Public");
  const [selectedDocType, setSelectedDocType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const resolvedPath = selectedDocType
    ? `${mockCurrentPath} > ${selectedDocType}`
    : `${mockCurrentPath} > [Select Document Type]`;

  const handleUpload = () => {
    setShowUploadDialog(false);
    setShowConfirmation(true);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Enhanced Upload UX Mockup</h1>
          <p className="text-gray-600 mb-4">
            This mockup demonstrates the new upload flow when a user clicks Upload from a main folder or sub-category.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setShowUploadDialog(true);
                setShowConfirmation(false);
              }}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
            >
              Show Upload Dialog
            </button>
            <button
              onClick={() => {
                setShowUploadDialog(false);
                setShowConfirmation(true);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Show Confirmation
            </button>
          </div>
        </div>

        {showUploadDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Upload className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Upload Document</h2>
                    <p className="text-sm text-gray-500">Current Location: {mockCurrentPath}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUploadDialog(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <ShieldAlert className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">Important Information</p>
                      <p className="text-sm text-blue-700">
                        Uploading is allowed only within a Document Type folder.
                        The system will automatically store your document in the correct location.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Select File to Upload
                    </div>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Click to browse or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX, XLS, XLSX (Max 50MB)
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                  {selectedFile && (
                    <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm text-emerald-700 font-medium">{selectedFile.name}</span>
                    </div>
                  )}
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
                    onChange={(e) => setSelectedConfidentiality(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    <option value="Public">Public</option>
                    <option value="Confidential">Confidential</option>
                    <option value="Secret">Secret</option>
                    <option value="Top Secret">Top Secret</option>
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
                  <select
                    value={selectedDocType}
                    onChange={(e) => setSelectedDocType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    <option value="">Select a Document Type...</option>
                    {mockDocumentTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Filtered to show only Document Types available in {mockCurrentPath}
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FolderOpen className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Document will be stored in:
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-900 font-medium bg-white px-3 py-2 rounded border border-gray-200">
                        {resolvedPath.split(' > ').map((part, index, array) => (
                          <React.Fragment key={index}>
                            <span className={index === array.length - 1 && selectedDocType ? 'text-emerald-600' : ''}>
                              {part}
                            </span>
                            {index < array.length - 1 && (
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleUpload}
                    disabled={!selectedDocType || !selectedFile}
                    className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Document
                  </button>
                  <button
                    onClick={() => setShowUploadDialog(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Upload Successful!
                  </h3>

                  <p className="text-sm text-gray-600 mb-4">
                    Your document has been uploaded successfully to:
                  </p>

                  <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-900 font-medium justify-center flex-wrap">
                      {resolvedPath.split(' > ').map((part, index, array) => (
                        <React.Fragment key={index}>
                          <span className={index === array.length - 1 ? 'text-emerald-600' : ''}>
                            {part}
                          </span>
                          {index < array.length - 1 && (
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => {
                        setShowConfirmation(false);
                        alert('Navigate to folder: ' + resolvedPath);
                      }}
                      className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <FolderOpen className="w-4 h-4" />
                      Go to Folder
                    </button>
                    <button
                      onClick={() => setShowConfirmation(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Design Notes</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex gap-3">
              <div className="w-5 h-5 bg-emerald-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-600 font-bold text-xs">1</span>
              </div>
              <p>
                <strong>Dialog Trigger:</strong> Appears only when clicking Upload from a main folder or sub-category (not from a Document Type folder)
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 bg-emerald-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-600 font-bold text-xs">2</span>
              </div>
              <p>
                <strong>Confidentiality Level:</strong> Required dropdown with 4 options (Public, Confidential, Secret, Top Secret)
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 bg-emerald-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-600 font-bold text-xs">3</span>
              </div>
              <p>
                <strong>Document Type Filtering:</strong> Dropdown shows only Document Types belonging to the current folder context
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 bg-emerald-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-600 font-bold text-xs">4</span>
              </div>
              <p>
                <strong>Target Path Display:</strong> Shows the resolved path dynamically as user selects Document Type
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 bg-emerald-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-600 font-bold text-xs">5</span>
              </div>
              <p>
                <strong>Confirmation Dialog:</strong> After successful upload, shows success message with "Go to Folder" and "OK" buttons
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-xs">i</span>
              </div>
              <p>
                <strong>Information Message:</strong> Blue info box explains that documents are stored in Document Type folders
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Visual Hierarchy Suggestion</h2>
          <p className="text-sm text-gray-600 mb-4">
            Folder icons should be visually distinct based on their purpose:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <FolderOpen className="w-6 h-6 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Navigation Folder</span>
              </div>
              <p className="text-xs text-gray-500 pl-9">
                Main folders and sub-categories (above Document Type level). Gray icon indicates navigation-only.
              </p>
            </div>
            <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50">
              <div className="flex items-center gap-3 mb-2">
                <FolderOpen className="w-6 h-6 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">Document Type Folder</span>
              </div>
              <p className="text-xs text-emerald-600 pl-9">
                Upload-enabled folders. Green/emerald icon indicates documents can be uploaded directly here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
