// js/parte2/prelim_scrutinio.js

document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("verbale:aggiornato", (e) => {
        eseguiRiportiEQuadratureParte2();
    });

    document.addEventListener("verbale:ricaricato", () => {
        eseguiRiportiEQuadratureParte2();
    });

    // Aggancio diretto degli eventi di digitazione sui campi del paragrafo 23
    const inputsVotanti = document.querySelectorAll("#p23-v1, #p23-v2, #p23-v3, #p23-v4, #p23-v5, #p23-v6");
    inputsVotanti.forEach(input => {
        input.addEventListener("input", () => {
            // Notifichiamo l'aggiornamento dell'input al motore generale
            if(typeof VERBALE_DATA !== 'undefined') {
                impostaValoreDaPath(VERBALE_DATA, input.getAttribute("data-path"), parseFloat(input.value) || 0);
                localStorage.setItem("verbale_elettorale_mod39cs", JSON.stringify(VERBALE_DATA));
            }
            eseguiRiportiEQuadratureParte2();
        });
    });

    setTimeout(() => {
        eseguiRiportiEQuadratureParte2();
    }, 300);
});

// Esponiamo la funzione globalmente per farla chiamare anche da autenticazione.js
window.eseguiRiportiEQuadratureParte2 = function() {
    if (typeof VERBALE_DATA === 'undefined') return;

    const casi = VERBALE_DATA.parte1.casi || {};
    
    const v_13 = parseFloat(casi.elettori_allontanati) || 0;
    const v_10 = parseFloat(casi.schede_deteriorate) || 0;
    const v_14_sopra = parseFloat(casi.schede_senza_bollo) || 0;
    const v_14_sotto = parseFloat(casi.schede_non_riconsegnate) || 0;
    const v_15 = parseFloat(casi.rifiuto_cabina) || 0;

    // Compila i campi di sola lettura in Parte 2
    if(document.getElementById("p21-a")) document.getElementById("p21-a").value = v_13;
    if(document.getElementById("p21-b")) document.getElementById("p21-b").value = v_10;
    if(document.getElementById("p21-c")) document.getElementById("p21-c").value = v_14_sopra;
    if(document.getElementById("p21-d")) document.getElementById("p21-d").value = v_14_sotto;
    if(document.getElementById("p21-e")) document.getElementById("p21-e").value = v_15;

    const totale_p21 = v_13 + v_10 + v_14_sopra + v_14_sotto + v_15;
    if(document.getElementById("p21-totale")) document.getElementById("p21-totale").textContent = totale_p21;

    // Calcolo Votanti Sezione (§23)
    const v1 = parseFloat(document.getElementById("p23-v1").value) || 0;
    const v2 = parseFloat(document.getElementById("p23-v2").value) || 0;
    const v3 = parseFloat(document.getElementById("p23-v3").value) || 0;
    const v4 = parseFloat(document.getElementById("p23-v4").value) || 0;
    const v5 = parseFloat(document.getElementById("p23-v5").value) || 0;
    const v6 = parseFloat(document.getElementById("p23-v6").value) || 0;

    const totaleVotanti = v1 + v2 + v3 + v4 + v5 + v6;
    if(document.getElementById("p23-totale-votanti")) document.getElementById("p23-totale-votanti").textContent = totaleVotanti;

    VERBALE_DATA.parte2.p21_p22_p23_calcolati = {
        totale_schede_non_utilizzate_p21: totale_p21,
        totale_votanti_p23: totaleVotanti
    };
};