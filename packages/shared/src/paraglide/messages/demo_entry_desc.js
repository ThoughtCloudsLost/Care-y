/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_DescInputs */

const en_demo_entry_desc = /** @type {(inputs: Demo_Entry_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`CARE-Y is a call intake and case management system for mutual aid organizations serving populations that are at risk. Both clients and volunteers face real danger if their identities or case details are exposed, and CARE-Y mitigates this by encrypting all personally identifiable information in the browser before it reaches the server, so the server itself cannot read it.
This handbook pairs live documentation with a working simulator of the CARE-Y application, running the real code against a real database entirely in your browser. Nothing leaves your device. The text alongside it explains what each screen does, how the system is built, and what protections are in place.
The handbook is both user documentation and a transparency tool. Organizations with this risk profile should be able to verify the claims CARE-Y makes, and the simulator is built to let them do that by watching the system run. The trust boundary is the same one that applies to any hosted software, because you cannot verify what a server you do not control actually runs. CARE-Y is open source and built for self hosting, so organizations that prefer to run it on their own infrastructure can remove that boundary entirely. The full open source codebase is available through the GitHub link in the header.`)
};

const es_demo_entry_desc = /** @type {(inputs: Demo_Entry_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este manual combina documentación interactiva con un simulador funcional. El simulador ejecuta la aplicación real de CARE-Y sobre una base de datos en tu navegador, y nada sale de tu dispositivo. El texto a su lado explica lo que hace cada pantalla, cómo está construido el sistema y qué protecciones tiene.
CARE-Y es un sistema de gestión de llamadas y casos para organizaciones de ayuda mutua que atienden a poblaciones en riesgo. Tanto los clientes como las personas voluntarias corren peligro real si se exponen sus identidades o los detalles de sus casos, y CARE-Y mitiga esto cifrando toda la información personal en el navegador antes de que llegue al servidor, de modo que el servidor mismo no puede leerla.
El manual funciona como documentación para quienes usan la aplicación y como herramienta de transparencia. Las organizaciones con este perfil de riesgo deberían poder verificar las afirmaciones que CARE-Y hace, y el simulador está construido para permitirlo observando el sistema en funcionamiento. El límite de confianza es el mismo que aplica a cualquier software alojado, porque no se puede verificar qué ejecuta realmente un servidor que no se controla. CARE-Y es de código abierto y está preparado para el alojamiento propio, lo que elimina ese límite por completo, y el enlace de GitHub en la cabecera apunta al código fuente completo.`)
};

const en_xa2_demo_entry_desc = /** @type {(inputs: Demo_Entry_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦CÀRÈ-Y ìs à càll ìntàkè ànd càsè mànàgèmènt systèm fòr mùtùàl àìd òrgànìzàtìòns sèrvìng pòpùlàtìòns thàt àrè àt rìsk. Bòth clìènts ànd vòlùntèèrs fàcè rèàl dàngèr ìf thèìr ìdèntìtìès òr càsè dètàìls àrè èxpòsèd, ànd CÀRÈ-Y mìtìgàtès thìs by èncryptìng àll pèrsònàlly ìdèntìfìàblè ìnfòrmàtìòn ìn thè bròwsèr bèfòrè ìt rèàchès thè sèrvèr, sò thè sèrvèr ìtsèlf cànnòt rèàd ìt.
Thìs hàndbòòk pàìrs lìvè dòcùmèntàtìòn wìth à wòrkìng sìmùlàtòr òf thè CÀRÈ-Y àpplìcàtìòn, rùnnìng thè rèàl còdè àgàìnst à rèàl dàtàbàsè èntìrèly ìn yòùr bròwsèr. Nòthìng lèàvès yòùr dèvìcè. Thè tèxt àlòngsìdè ìt èxplàìns whàt èàch scrèèn dòès, hòw thè systèm ìs bùìlt, ànd whàt pròtèctìòns àrè ìn plàcè.
Thè hàndbòòk ìs bòth ùsèr dòcùmèntàtìòn ànd à trànspàrèncy tòòl. Òrgànìzàtìòns wìth thìs rìsk pròfìlè shòùld bè àblè tò vèrìfy thè clàìms CÀRÈ-Y màkès, ànd thè sìmùlàtòr ìs bùìlt tò lèt thèm dò thàt by wàtchìng thè systèm rùn. Thè trùst bòùndàry ìs thè sàmè ònè thàt àpplìès tò àny hòstèd sòftwàrè, bècàùsè yòù cànnòt vèrìfy whàt à sèrvèr yòù dò nòt còntròl àctùàlly rùns. CÀRÈ-Y ìs òpèn sòùrcè ànd bùìlt fòr sèlf hòstìng, sò òrgànìzàtìòns thàt prèfèr tò rùn ìt òn thèìr òwn ìnfràstrùctùrè càn rèmòvè thàt bòùndàry èntìrèly. Thè fùll òpèn sòùrcè còdèbàsè ìs àvàìlàblè thròùgh thè GìtHùb lìnk ìn thè hèàdèr. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "CARE-Y is a call intake and case management system for mutual aid organizations serving populations that are at risk. Both clients and volunteers face real d..." |
*
* @param {Demo_Entry_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_entry_desc = /** @type {((inputs?: Demo_Entry_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Entry_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_entry_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_entry_desc(inputs)
	return en_demo_entry_desc(inputs)
});