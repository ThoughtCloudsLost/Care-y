/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Roster_Tools_BodyInputs */

const en_demo_narrative_admin_roster_tools_body = /** @type {(inputs: Demo_Narrative_Admin_Roster_Tools_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Four filters, three sort fields and a search narrow the roster after the browser has fetched it, so none of them tell the server what was looked for. [[#privacy #client-data]]
**What each filter selects.** Role, account status, key state and queue membership, and a row has to satisfy every filter that is active. The key state comes out of two flags the roster query returns, so an account reads as ready, as having no keys at all, or as enrolled without a wrapped copy of the organization key. The queue filter matches against the whole assignment table rather than the reader's own queues. [Encryption keys and escrow](#admin-org/keys) covers what the two flags are about. [[#permissions #keys]]
**What search matches and what it misses.** A term of at least two characters is normalized and compared against display names the browser has already decrypted, and the term stays on the device. A row whose name will not decrypt is absent from every search result and sorted last by name, so a key problem reads as a missing row rather than an error. [[#privacy #failure-states]]
**Bulk deactivation.** Select mode deactivates the chosen accounts one request at a time, and the first refusal ends the run with the accounts before it already deactivated. Deactivating a single account asks for confirmation and offers to force past the sole-key-holder refusal, while the bulk path sends neither, so an account holding the last wrap for a case stays active. [User roster](#admin-people/people) covers what deactivation does to an account's keys. [[#failure-states #keys]]
**Where the narrowing runs.** \`filterUsers\` and \`sortUsers\` in \`packages/client/src/lib/admin/users-section-utils.ts\` take decryption as a callback rather than a value, which is what keeps sorting and searching on the device while the roster query itself returns ciphertext. [[#client-data]]`)
};

const es_demo_narrative_admin_roster_tools_body = /** @type {(inputs: Demo_Narrative_Admin_Roster_Tools_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuatro filtros, tres campos de ordenación y una búsqueda acotan el directorio después de que el navegador lo ha recibido, así que ninguno le dice al servidor qué se buscaba. [[#privacy #client-data]]
**Qué selecciona cada filtro.** El rol, el estado de la cuenta, el estado de las claves y la pertenencia a colas, y una fila tiene que cumplir todos los filtros activos. El estado de las claves sale de dos marcas que devuelve la consulta del directorio, de modo que una cuenta aparece como lista, como sin claves, o como inscrita pero sin una copia envuelta de la clave de la organización. El filtro de colas se compara con toda la tabla de asignaciones y no con las colas de quien consulta. [Claves de cifrado y custodia](#admin-org/keys) trata de qué hablan esas dos marcas. [[#permissions #keys]]
**Qué encuentra la búsqueda y qué se le escapa.** Un término de al menos dos caracteres se normaliza y se compara con los nombres que el navegador ya ha descifrado, y el término no sale del dispositivo. Una fila cuyo nombre no se puede descifrar no aparece en ningún resultado de búsqueda y se ordena al final por nombre, así que un problema de claves se lee como una fila ausente y no como un error. [[#privacy #failure-states]]
**Desactivación en lote.** El modo de selección desactiva las cuentas elegidas con una petición por cuenta, y el primer rechazo termina la tanda con las cuentas anteriores ya desactivadas. Desactivar una sola cuenta pide confirmación y ofrece forzar el rechazo por ser la única tenedora de claves, mientras que la vía en lote no envía ninguna de las dos cosas, así que una cuenta con el último envoltorio de un caso sigue activa. [Directorio de usuarios](#admin-people/people) trata qué le hace la desactivación a las claves de una cuenta. [[#failure-states #keys]]
**Dónde se acota.** \`filterUsers\` y \`sortUsers\`, en \`packages/client/src/lib/admin/users-section-utils.ts\`, reciben el descifrado como una función y no como un valor, que es lo que mantiene la ordenación y la búsqueda en el dispositivo mientras la consulta del directorio devuelve texto cifrado. [[#client-data]]`)
};

const en_xa2_demo_narrative_admin_roster_tools_body = /** @type {(inputs: Demo_Narrative_Admin_Roster_Tools_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fòùr fìltèrs, thrèè sòrt fìèlds ànd à sèàrch nàrròw thè ròstèr àftèr thè bròwsèr hàs fètchèd ìt, sò nònè òf thèm tèll thè sèrvèr whàt wàs lòòkèd fòr. [[#prìvàcy #clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt èàch fìltèr sèlècts. ••••••••** Ròlè, àccòùnt stàtùs, kèy stàtè ànd qùèùè mèmbèrshìp, ànd à ròw hàs tò sàtìsfy èvèry fìltèr thàt ìs àctìvè. Thè kèy stàtè còmès òùt òf twò flàgs thè ròstèr qùèry rètùrns, sò àn àccòùnt rèàds às rèàdy, às hàvìng nò kèys àt àll, òr às ènròllèd wìthòùt à wràppèd còpy òf thè òrgànìzàtìòn kèy. Thè qùèùè fìltèr màtchès àgàìnst thè whòlè àssìgnmènt tàblè ràthèr thàn thè rèàdèr's òwn qùèùès. [Èncryptìòn kèys ànd èscròw](#àdmìn-òrg/kèys) còvèrs whàt thè twò flàgs àrè àbòùt. [[#pèrmìssìòns #kèys]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt sèàrch màtchès ànd whàt ìt mìssès. ••••••••••••** À tèrm òf àt lèàst twò chàràctèrs ìs nòrmàlìzèd ànd còmpàrèd àgàìnst dìsplày nàmès thè bròwsèr hàs àlrèàdy dècryptèd, ànd thè tèrm stàys òn thè dèvìcè. À ròw whòsè nàmè wìll nòt dècrypt ìs àbsènt fròm èvèry sèàrch rèsùlt ànd sòrtèd làst by nàmè, sò à kèy pròblèm rèàds às à mìssìng ròw ràthèr thàn àn èrròr. [[#prìvàcy #fàìlùrè-stàtès]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Bùlk dèàctìvàtìòn. ••••••** Sèlèct mòdè dèàctìvàtès thè chòsèn àccòùnts ònè rèqùèst àt à tìmè, ànd thè fìrst rèfùsàl ènds thè rùn wìth thè àccòùnts bèfòrè ìt àlrèàdy dèàctìvàtèd. Dèàctìvàtìng à sìnglè àccòùnt àsks fòr cònfìrmàtìòn ànd òffèrs tò fòrcè pàst thè sòlè-kèy-hòldèr rèfùsàl, whìlè thè bùlk pàth sènds nèìthèr, sò àn àccòùnt hòldìng thè làst wràp fòr à càsè stàys àctìvè. [Ùsèr ròstèr](#àdmìn-pèòplè/pèòplè) còvèrs whàt dèàctìvàtìòn dòès tò àn àccòùnt's kèys. [[#fàìlùrè-stàtès #kèys]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whèrè thè nàrròwìng rùns. ••••••••** \`fìltèrÙsèrs\` ànd \`sòrtÙsèrs\` ìn \`pàckàgès/clìènt/src/lìb/àdmìn/ùsèrs-sèctìòn-ùtìls.ts\` tàkè dècryptìòn às à càllbàck ràthèr thàn à vàlùè, whìch ìs whàt kèèps sòrtìng ànd sèàrchìng òn thè dèvìcè whìlè thè ròstèr qùèry ìtsèlf rètùrns cìphèrtèxt. [[#clìènt-dàtà]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Four filters, three sort fields and a search narrow the roster after the browser has fetched it, so none of them tell the server what was looked for. [[#priv..." |
*
* @param {Demo_Narrative_Admin_Roster_Tools_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_roster_tools_body = /** @type {((inputs?: Demo_Narrative_Admin_Roster_Tools_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Roster_Tools_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_roster_tools_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_roster_tools_body(inputs)
	return en_demo_narrative_admin_roster_tools_body(inputs)
});