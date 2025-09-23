const Rechtliches = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="page-header">
          <h1 className="page-title">Rechtliches</h1>
          <p className="page-description">
            Wichtige rechtliche Informationen zur Nutzung von Toolbox24
          </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>Nutzungsbedingungen</h2>
          <p>
            Durch die Nutzung der Toolbox24-Website stimmen Sie den folgenden Nutzungsbedingungen zu:
          </p>
          
          <h3>1. Allgemeine Bestimmungen</h3>
          <p>
            Toolbox24 stellt kostenlose Online-Tools zur Verfügung, die direkt im Browser funktionieren. 
            Alle Bearbeitungen erfolgen lokal auf Ihrem Gerät - Ihre Dateien werden nicht auf unsere Server hochgeladen.
          </p>

          <h3>2. Haftungsausschluss</h3>
          <p>
            Die bereitgestellten Tools und Vorlagen dienen ausschließlich als Hilfsmittel und Muster. 
            Sie ersetzen keine professionelle Beratung oder rechtliche Prüfung. Die Nutzung erfolgt auf eigene Verantwortung.
          </p>

          <h3>3. Urheberrecht</h3>
          <p>
            Die auf Toolbox24 bereitgestellten Inhalte und Tools sind urheberrechtlich geschützt. 
            Eine Weiterverbreitung oder kommerzielle Nutzung ohne Genehmigung ist nicht gestattet.
          </p>

          <h3>4. Datenschutz</h3>
          <p>
            Da alle Tools client-side funktionieren, werden Ihre hochgeladenen Dateien nicht an unsere Server übertragen. 
            Weitere Informationen finden Sie in unserer Datenschutzerklärung.
          </p>

          <h3>5. Änderungen</h3>
          <p>
            Wir behalten uns das Recht vor, diese Nutzungsbedingungen jederzeit zu ändern. 
            Änderungen werden auf dieser Seite veröffentlicht.
          </p>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Stand:</strong> Dezember 2024<br/>
              Bei Fragen wenden Sie sich bitte über unsere Kontaktseite an uns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rechtliches;