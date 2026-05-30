import os

file_path = os.path.join(os.path.dirname(__file__), 'frontend', 'src', 'app', 'dashboard', 'page.tsx')
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Locate the transition between AI Diagnostics recommendations card and Statistics Studio
target_transition = """                  {aiCleaned && !aiCleaning && (
                    <div className="pt-2">
                      <Button
                        onClick={handleDownloadCleaned}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-5 shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 transition-all font-semibold flex items-center justify-center gap-1.5 cursor-pointer text-xs border-none"
                      >
                        <UploadCloud className="w-3.5 h-3.5 rotate-180" /> Download Cleaned Dataset
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
{/* 5. Advanced AI Statistical & Forecasting Studio */}"""

replacement_transition = """                  {aiCleaned && !aiCleaning && (
                    <div className="pt-2">
                      <Button
                        onClick={handleDownloadCleaned}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-5 shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 transition-all font-semibold flex items-center justify-center gap-1.5 cursor-pointer text-xs border-none"
                      >
                        <UploadCloud className="w-3.5 h-3.5 rotate-180" /> Download Cleaned Dataset
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
{/* 5. Advanced AI Statistical & Forecasting Studio */}"""

if content.find(target_transition) == -1:
    target_transition = target_transition.replace("\n", "\r\n")
    replacement_transition = replacement_transition.replace("\n", "\r\n")

if content.find(target_transition) == -1:
    print("AI Recommendations to Studio transition not found!")
    exit(1)

content = content.replace(target_transition, replacement_transition, 1)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Visualizer grid successfully closed before Statistics Studio starts!")
