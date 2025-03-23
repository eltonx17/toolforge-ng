export class MonacoConfig {
  static configure() {
    (self as any).MonacoEnvironment = {
      getWorkerUrl: function (moduleId: any, label: string) {
        return `assets/monaco/min/vs/base/worker/workerMain.js`;
      }
    };
  }

  static getEditorOptions(language: string = 'text', theme: string = 'vs-light') {
    return {
      language,
      theme,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      lineHeight: 20,
      wordWrap: 'on',
      wrappingIndent: 'indent',
    };
  }
}
