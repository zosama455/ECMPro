import {
  Search,
  Upload,
  FolderPlus,
  Grid3x3,
  List as ListIcon,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  ChevronRight,
  FolderIcon,
  FileText,
} from 'lucide-react';

export function FolderSearchUIMockup() {
  return (
    <div className="flex-1 bg-gray-50 overflow-auto p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="bg-white p-6 rounded-xl border-2 border-emerald-500 shadow-lg">
          <div className="mb-4 flex items-center gap-2">
            <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
              STATE A
            </div>
            <h2 className="text-xl font-bold text-gray-900">Root Level (No Folder Scope)</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            When user is at the root level, only the standard search bar appears. No folder scope indicator is shown.
          </p>

          <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Files</h1>
                    <p className="text-gray-500 text-sm">45 files</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="px-5 py-2.5 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium shadow-sm">
                    <Upload className="w-4 h-4" />
                    Upload File
                  </button>
                  <button className="px-5 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2 font-medium shadow-sm">
                    <FolderPlus className="w-4 h-4" />
                    Create New
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex gap-4 items-center">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search files by name, type, or tags..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <button className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 font-medium transition-colors">
                    <Filter className="w-4 h-4" />
                    Filters
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
                    <button className="p-2 bg-emerald-100 text-emerald-600 rounded-lg transition-colors">
                      <Grid3x3 className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <ListIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border-2 border-blue-500 shadow-lg">
          <div className="mb-4 flex items-center gap-2">
            <div className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
              STATE B
            </div>
            <h2 className="text-xl font-bold text-gray-900">Inside Folder (With Scope Indicator)</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            When user navigates into a folder, a folder scope indicator appears below the search bar showing the current search context with breadcrumb-style path and a clear button to reset to global search.
          </p>

          <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Files</h1>
                    <p className="text-gray-500 text-sm">12 files</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="px-5 py-2.5 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium shadow-sm">
                    <Upload className="w-4 h-4" />
                    Upload File
                  </button>
                  <button className="px-5 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2 font-medium shadow-sm">
                    <FolderPlus className="w-4 h-4" />
                    Create New
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex gap-4 items-center mb-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search files by name, type, or tags..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <button className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 font-medium transition-colors">
                    <Filter className="w-4 h-4" />
                    Filters
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
                    <button className="p-2 bg-emerald-100 text-emerald-600 rounded-lg transition-colors">
                      <Grid3x3 className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <ListIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Search className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-blue-900 font-medium">Searching in:</span>
                    <div className="flex items-center gap-1 text-blue-700">
                      <span className="hover:underline cursor-pointer">HR</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                      <span className="hover:underline cursor-pointer">Employees</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                      <span className="font-semibold">Certificates</span>
                    </div>
                  </div>
                  <button className="flex items-center gap-1.5 text-blue-700 hover:text-blue-900 font-medium text-sm transition-colors">
                    <X className="w-4 h-4" />
                    Clear scope
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-700 text-xs font-bold">!</span>
                </div>
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Design Notes:</p>
                  <ul className="list-disc list-inside space-y-1 text-amber-700">
                    <li>The folder scope indicator only appears when inside a folder</li>
                    <li>Breadcrumb path is clickable to navigate to parent folders</li>
                    <li>Clear scope button resets search to global (root level)</li>
                    <li>Uses existing blue color scheme for consistency</li>
                    <li>Maintains all current search functionality</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border-2 border-gray-300 shadow-lg">
          <div className="mb-4 flex items-center gap-2">
            <div className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-full">
              EMPTY STATE
            </div>
            <h2 className="text-xl font-bold text-gray-900">No Results in Folder</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            When no documents match the search within the current folder scope, show a helpful empty state message.
          </p>

          <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found in this folder</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Try adjusting your search terms or filters, or search in a different folder.
                </p>
                <button className="px-4 py-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-2 mx-auto">
                  <X className="w-4 h-4" />
                  Clear search and show all files in this folder
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-xl border-2 border-dashed border-emerald-300">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              i
            </span>
            Implementation Summary
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>Key Features:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Folder scope indicator appears only when inside a folder (not at root)</li>
              <li>Breadcrumb-style path shows the full folder hierarchy</li>
              <li>Each breadcrumb segment is clickable to navigate up the folder tree</li>
              <li>Clear scope button (X icon + text) resets search to global</li>
              <li>Empty state provides helpful message when no results found</li>
              <li>Uses existing color scheme (blue tones) for consistency</li>
              <li>Maintains all existing search bar functionality</li>
            </ul>
            <p className="mt-3"><strong>Design Principles:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Subtle and non-intrusive - doesn't clutter the interface</li>
              <li>Clear visual hierarchy with existing components</li>
              <li>Intuitive interaction - obvious how to clear/navigate</li>
              <li>Consistent with current design language</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
