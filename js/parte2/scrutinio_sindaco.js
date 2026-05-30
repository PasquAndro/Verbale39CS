// js/parte2/scrutinio_sindaco.js

document.addEventListener("DOMContentLoaded", () => {
    // Intercetta le modifiche inviate dal motore app.js
    document.addEventListener("verbale:aggiornato", () => {
        eseguiCalcoliScrutinioSindaco();
    });

    document.addEventListener("verbale:ricaricato", () => {
        eseguiCalcoliScrutinioSindaco();
    });

    // Aggancio dei listener diretti sugli input dello scrutinio per reattività istantanea
    const inputsScrutinio = document.querySelectorAll(".voti-sindaco-input, #scrut-bianche, #scrut-nulle, #scrut-solo-nulli");
    inputsScrutinio.forEach(input => {
        input.addEventListener("input", eseguiCalcoliScrutinioSindaco);
    });

    setTimeout(eseguiCalcoliScrutinioSindaco, 400);
});

function eseguiCalcoliScrutinioSindaco() {
    // 1. RECUPERO VOTI VALIDI AI CANDIDATI SINDACO DAL DOM
    let totaleVotiSindaco = 0;
    for (let i = 1; i <= 5; i++) {
        const elVoti = document.getElementById(`voti-sindaco-${i}`);
        totaleVotiSindaco += elVoti ? (parseFloat(elVoti.value) || 0) : 0;
    }
    
    if (document.getElementById("totale-voti-sindaco")) {
        document.getElementById("totale-voti-sindaco").textContent = totaleVotiSindaco;
    }

    // 2. RECUPERO SCHEDE NON VALIDE
    const elB = document.getElementById("scrut-bianche");
    const elN = document.getElementById("scrut-nulle");
    const elSN = document.getElementById("scrut-solo-nulli");

    const bianche = elB ? (parseFloat(elB.value) || 0) : 0;
    const nulle = elN ? (parseFloat(elN.value) || 0) : 0;
    const soloNulli = elSN ? (parseFloat(elSN.value) || 0) : 0;

    // 3. CALCOLO TOTALE GENERALE SCHEDE SCRUTINATE (§ 38)
    const totaleSchedeScrutinate = totaleVotiSindaco + bianche + nulle + soloNulli;

    // Aggiornamento riepilogo testuale sinistro del prospetto
    if (document.getElementById("quad-voti-validi")) document.getElementById("quad-voti-validi").textContent = totaleVotiSindaco;
    if (document.getElementById("quad-bianche")) document.getElementById("quad-bianche").textContent = bianche;
    if (document.getElementById("quad-nulle")) document.getElementById("quad-nulle").textContent = nulle;
    if (document.getElementById("quad-solo-nulli")) document.getElementById("quad-solo-nulli").textContent = soloNulli;
    if (document.getElementById("quad-totale-scrutinate")) document.getElementById("quad-totale-scrutinate").textContent = totaleSchedeScrutinate;

    // 4. VERIFICA DELLA QUADRATURA CON I VOTANTI DEL PARAGRAFO §23
    let totaleVotantiSezione = 0;
    if (typeof VERBALE_DATA !== 'undefined' && VERBALE_DATA.parte2.p21_p22_p23_calcolati) {
        totaleVotantiSezione = VERBALE_DATA.parte2.p21_p22_p23_calcolati.totale_votanti_p23 || 0;
    } else {
        // Fallback di lettura diretta sul DOM se l'oggetto globale non è ancora pronto
        const txtTotVotanti = document.getElementById("p23-totale-votanti");
        totaleVotantiSezione = txtTotVotanti ? (parseFloat(txtTotVotanti.textContent) || 0) : 0;
    }

    // Gestione visiva del pannello di quadratura destra
    const pannello = document.getElementById("pannello-stato-quadratura");
    const icona = document.getElementById("quad-icona");
    const messaggio = document.getElementById("quad-messaggio");
    const diffText = document.getElementById("quad-differenza");

    if (pannello) {
        if (totaleVotantiSezione === 0 && totaleSchedeScrutinate === 0) {
            // Stato iniziale vuoto
            pannello.style.backgroundColor = "#ffffff";
            pannello.style.borderColor = "#ccc";
            pannello.style.color = "#7f8c8d";
            icona.textContent = "⚪";
            messaggio.textContent = "In attesa dell'inserimento dei dati di spoglio...";
            diffText.textContent = "";
        } else if (totaleSchedeScrutinate === totaleVotantiSezione) {
            // QUADRATURA PERFETTA!
            pannello.style.backgroundColor = "#e8f5e9";
            pannello.style.borderColor = "#2e7d32";
            pannello.style.color = "#2e7d32";
            icona.textContent = "✅";
            messaggio.textContent = "QUADRATURA PERFETTA!";
            diffText.textContent = `Schede scrutinate (${totaleSchedeScrutinate}) corrispondono esattamente ai votanti (${totaleVotantiSezione}).`;
        } else {
            // ERRORE DI QUADRATURA
            const differenza = totaleVotantiSezione - totaleSchedeScrutinate;
            pannello.style.backgroundColor = "#ffebee";
            pannello.style.borderColor = "#c62828";
            pannello.style.color = "#c62828";
            icona.textContent = "❌";
            messaggio.textContent = "DISCORDANZA DATI!";
            
            if (differenza > 0) {
                diffText.textContent = `Mancano all'appello ${differenza} schede rispetto ai votanti registrati (${totaleVotantiSezione}).`;
            } else {
                diffText.textContent = `Ci sono ${Math.abs(differenza)} schede in PIÙ rispetto ai votanti registrati (${totaleVotantiSezione}).`;
            }
        }
    }

    // Conserviamo i dati calcolati nello stato persistente
    if (typeof VERBALE_DATA !== 'undefined') {
        if (!VERBALE_DATA.parte2.scrutinio) VERBALE_DATA.parte2.scrutinio = {};
        VERBALE_DATA.parte2.scrutinio.sindaco_totale_validi = totaleVotiSindaco;
        VERBALE_DATA.parte2.scrutinio.totale_schede_scrutinate = totaleSchedeScrutinate;
        VERBALE_DATA.parte2.scrutinio.quadra_con_votanti = (totaleSchedeScrutinate === totaleVotantiSezione);
        localStorage.setItem("verbale_elettorale_mod39cs", JSON.stringify(VERBALE_DATA));
    }
}