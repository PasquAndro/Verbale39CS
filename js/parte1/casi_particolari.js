// js/parte1/casi_particolari.js

document.addEventListener("DOMContentLoaded", () => {
    // Ascolta le variazioni dei campi legati ai casi particolari
    document.addEventListener("verbale:aggiornato", (e) => {
        const { path } = e.detail;
        if (path.startsWith("parte1.casi")) {
            calcolaTotaleSchedeAnnullate();
        }
    });

    document.addEventListener("verbale:ricaricato", () => {
        calcolaTotaleSchedeAnnullate();
    });

    // Esegui calcolo iniziale
    setTimeout(() => {
        calcolaTotaleSchedeAnnullate();
    }, 100);
});

/**
 * CALCOLO AUTOMATICO DELLE SCHEDE DA DESTINARE ALLA BUSTA 4-CS BIS
 * Secondo le istruzioni del verbale, la Busta 4-CS bis deve contenere la somma di:
 * - Schede ritirate ad elettori allontanati (§13)
 * - Schede deteriorate sostituite (§10)
 * - Schede restituite senza bollo o firma (§14)
 * - Schede di elettori che si sono rifiutati di entrare in cabina (§15)
 * Nota bene: Le schede NON RICONSEGNATE (§14) NON vanno nella busta perché l'elettore se l'è portate via!
 */
function calcolaTotaleSchedeAnnullate() {
    const deteriorate = parseFloat(document.getElementById("p10-deteriorate").value) || 0;
    const allontanati = parseFloat(document.getElementById("p13-allontanati").value) || 0;
    const senzaBollo = parseFloat(document.getElementById("p14-senza-bollo").value) || 0;
    const rifiutoCabina = parseFloat(document.getElementById("p15-rifiuto-cabina").value) || 0;

    // Aritmetica delle schede fisiche annullate
    const totaleAnnullateBusta4Bis = deteriorate + allontanati + senzaBollo + rifiutoCabina;

    // Stampa il risultato a schermo
    document.getElementById("p1-totale-annullate").textContent = totaleAnnullateBusta4Bis;

    // Salva il calcolo nello stato globale per i moduli dello scrutinio
    if (typeof VERBALE_DATA !== 'undefined') {
        VERBALE_DATA.parte1.casi_calcolati = {
            totale_schede_annullate_busta4bis: totaleAnnullateBusta4Bis
        };
        localStorage.setItem("verbale_elettorale_mod39cs", JSON.stringify(VERBALE_DATA));
    }
}