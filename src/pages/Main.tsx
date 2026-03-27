import React from 'react';

export default function Main() {
  return (
    <div>
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
      <header className="bg-green-600 text-white py-4 px-6 shadow">
        <h1 className="text-lg font-semibold">
          <span>
            Admin Panel - AI Game Editor
          </span>
        </h1>
      </header>
      <main className="flex-grow flex flex-row">
        <nav className="w-64 bg-gray-200 p-4 space-y-4">
          <a className="block py-2 px-3 rounded text-gray-800 hover:bg-gray-300 hover:text-gray-900" href="/admin/games-management">
            Games Management
          </a>
          <a className="block py-2 px-3 rounded text-gray-800 hover:bg-gray-300 hover:text-gray-900" href="/admin/ai-game-editor">
            AI Game Editor
          </a>
          <a className="block py-2 px-3 rounded text-gray-800 hover:bg-gray-300 hover:text-gray-900" href="/admin/settings">
            Settings
          </a>
        </nav>
        <section className="flex-grow bg-white p-6 shadow rounded-lg m-4">
          <header className="flex justify-between items-center pb-4 border-b">
            <h2 className="text-xl font-bold">
              <span>
                AI-Powered Game Editor
              </span>
            </h2>
            <Button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Save Changes
            </Button>
          </header>
          <form className="mt-4 space-y-6">
            <div className="space-y-2">
              <Label className="text-lg font-medium">
                Game Name:
              </Label>
              <Input className="block w-full px-4 py-2 border rounded" type="text" placeholder="Enter game name here"></Input>
            </div>
            <div className="space-y-2">
              <Label className="text-lg font-medium">
                Difficulty Level:
              </Label>
              <Input className="block w-full px-4 py-2 border rounded" type="text" placeholder="Enter difficulty level"></Input>
            </div>
            <div className="space-y-2">
              <Label className="text-lg font-medium">
                AI Optimizations:
              </Label>
              <div className="flex items-center space-x-2">
                <input className="form-checkbox rounded text-green-600" type="checkbox" />
                <span className="text-sm">
                  Enable AI optimizations for gameplay
                </span>
              </div>
            </div>
          </form>
        </section>
      </main>
    </div>
    </div>
  );
}
