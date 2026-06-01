# Presentazione del Progetto: Gestione Digitale Verbale Mod. 39-CS
Questo applicativo nasce come un assistente digitale intelligente per l'Ufficio Elettorale di Sezione, specificamente tarato sulle complessità normative della Regione Siciliana (L.R. 35/1997 e successive modifiche). Il suo obiettivo principale è digitalizzare, velocizzare e blindare matematicamente le operazioni del seggio, eliminando il rischio di errori di calcolo prima della trascrizione definitiva sul verbale cartaceo ufficiale.

L'applicazione si articola su tre pilastri fondamentali: la flessibilità organizzativa pre-voto, l'adattamento dinamico alla popolazione del comune e, soprattutto, un sistema avanzato di riscontro interno in tempo reale.

1. Il modulo "Firma Schede": Ripartizione scientifica del lavoro
Una delle fasi preliminari più delicate è l'autenticazione delle schede mediante la firma dello Scrutatore e il timbro del seggio. L'applicazione include un algoritmo di pianificazione strategica:

Scelta della taglia: Il Presidente può impostare la preparazione di mazzetti da 25 o 50 schede, a seconda della comodità logistica del tavolo.

Divisione equa tra i firmatari: Partendo dal Numero di schede da autenticare, il sistema calcola la distribuzione esatta dei mazzetti tra i 5 membri del seggio abilitati alla firma (i 4 Scrutatori e il Vice Presidente).

Tracciabilità: Fornisce un piano visivo chiaro che indica quanti mazzetti e quante schede totali spettano a ciascun componente, ottimizzando i tempi e prevenendo sfasature nel conteggio della Busta 3-CS (schede residue).

2. Adattamento Dinamico alla Legislazione Siciliana
La legge elettorale della Regione Siciliana si differenzia da quella nazionale e prevede adempimenti diversi a seconda della dimensione demografica del Comune. Il software recepisce questa sfasatura all'origine tramite una selezione preliminare in testa al modulo:

Comuni SINO a 15.000 abitanti (Sistema Maggioritario): In questi territori il voto è univoco e bloccato. Il voto dato al Sindaco si estende alla lista, e viceversa; il voto disgiunto è vietato. Il software si configura automaticamente disabilitando e azzerando i campi del voto "Solo Sindaco", poiché per legge i voti validi dei candidati Sindaco e quelli delle liste comunali devono muoversi in perfetta parità.

Comuni SUPERIORI a 15.000 abitanti (Sistema Proporzionale): In questa casistica il voto disgiunto è ammesso ed è possibile votare un candidato Sindaco esprimendo al contempo la preferenza per una lista non collegata, o votare il "Solo Sindaco". Il software sblocca istantaneamente le colonne di spoglio dedicate, permettendo di registrare questa sfasatura fisiologica.

3. La Tabella BIS: Il "Salvagente" del Presidente di Seggio
Il vero cuore innovativo del progetto è la Tabella BIS Personale per il Controllo Interno.

Mentre il Prospetto di Quadratura Ufficiale (§ 38) esegue il calcolo ministeriale classico per verificare che le schede scrutinate corrispondano ai votanti del paragrafo 23, la Tabella BIS esegue un controllo incrociato e speculare di tipo "orizzontale".

Nello scrutinio dei comuni grandi, i voti dei candidati Sindaco (§ 36) e i voti del Consiglio (§ 37) viaggiano su binari separati. Questo rende facile commettere errori di trascrizione o scambi di mazzetti tra i tavoli senza accorgersene se non a fine giornata. La Tabella BIS risolve questo problema applicando un principio matematico rigido:

Estrae in automatico il totale verticale dei voti espressi SOLO per il candidato Sindaco.

Vi somma il Totale dei voti di lista del Consiglio Comunale (§ 37), le schede Bianche, le Nulle e le schede Contestate non assegnate (Colonna B).

Il risultato?
Se i dati inseriti dai verbali del Sindaco e del Consiglio sono corretti, questa somma deve restituire esattamente il numero dei votanti totali della sezione.

L'applicazione gestisce questa logica con un sistema semaforico visivo:

VERDE (Quadratura OK): Se i dati coincidono al millesimo, il sistema rassicura il Presidente che lo spoglio interno è perfetto e che non ci sono schede disperse tra Sindaco e Consiglio.

ROSSO (Alert): Se viene rilevato anche un solo voto di differenza, l'applicazione mostra un alert visivo segnalando lo scarto esatto. Questo permette al seggio di fermarsi subito, ricontare il mazzetto incriminato e correggere l'errore all'istante, evitando le storiche "nottate" alla ricerca del voto perduto prima della chiusura del plico.
