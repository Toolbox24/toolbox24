const Impressum = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="page-header">
          <h1 className="page-title">Impressum</h1>
          <p className="page-description">
            Angaben gemäß § 5 TMG
          </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>Anbieter</h2>
          <p>
            <strong>Toolbox24</strong><br/>
            [Ihr Name/Firmenname]<br/>
            [Straße und Hausnummer]<br/>
            [PLZ und Ort]<br/>
            Deutschland
          </p>

          <h3>Kontakt</h3>
          <p>
            E-Mail: [Ihre E-Mail-Adresse]<br/>
            Telefon: [Ihre Telefonnummer]<br/>
            Website: www.toolbox24.ch
          </p>

          <h3>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h3>
          <p>
            [Ihr Name]<br/>
            [Adresse]
          </p>

          <h2>Haftungsausschluss</h2>
          
          <h3>Haftung für Inhalte</h3>
          <p>
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den 
            allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht 
            unter der Verpflichtung, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach 
            Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
          </p>

          <h3>Haftung für Links</h3>
          <p>
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. 
            Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten 
            Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
          </p>

          <h3>Urheberrecht</h3>
          <p>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen 
            Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der 
            Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Hinweis:</strong> Bitte ersetzen Sie die Platzhalter-Angaben durch Ihre tatsächlichen Daten.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Impressum;