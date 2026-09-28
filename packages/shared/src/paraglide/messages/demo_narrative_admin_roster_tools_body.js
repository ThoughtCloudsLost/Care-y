/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Roster_Tools_BodyInputs */

const en_demo_narrative_admin_roster_tools_body = /** @type {(inputs: Demo_Narrative_Admin_Roster_Tools_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filtering, sorting and searching the roster all run in the browser after the full list has loaded, so none of them send search terms or filter selections to the server. [[#privacy #client-data]]
**What does each filter select?** The filters narrow by role, account status, key state and queue membership. A row must satisfy every active filter. The key state filter uses two flags from the roster query and reads as Ready, Hasn't signed in yet or Needs a key share. The queue filter matches against every queue assignment in the organization, not only the queues the reader belongs to; loading the assignments requires the Manage queue membership permission. [Encryption keys and escrow](#admin-org/keys) covers what the two flags mean. [[#permissions #keys]]
**What does search match?** The browser compares a normalized term against display names it has already decrypted, starting at two characters. The term stays on the device. An account whose display name fails to decrypt is excluded from search results and sorted last by name, so a key problem looks like a missing row rather than an error. [[#privacy #failure-states]]
**Bulk deactivation.** Bulk deactivation confirms the count and the consequence before proceeding. The bulk path sends no force flag, so an account that is the sole key holder for a case stays active. Each account in the selection is attempted, and the result reports which accounts were refused. Deactivating a single account opens a confirmation first and offers to force past the sole-key-holder refusal. [User roster](#admin-people/people) covers what deactivation does to an account's keys. [[#failure-states #keys]]
**The filter and sort utilities.** \`filterUsers\` and \`sortUsers\` in \`packages/client/src/lib/admin/users-section-utils.ts\` accept a decryption callback rather than pre-decrypted values, which keeps the comparison on the device while the roster query returns ciphertext. [[#client-data]]`)
};

const es_demo_narrative_admin_roster_tools_body = /** @type {(inputs: Demo_Narrative_Admin_Roster_Tools_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El filtrado, la ordenación y la búsqueda del directorio se ejecutan en el navegador después de cargar la lista completa, de modo que ninguno envía términos de búsqueda ni selecciones de filtro al servidor. [[#privacy #client-data]]
**¿Qué selecciona cada filtro?** Los filtros acotan por rol, estado de la cuenta, estado de las claves y pertenencia a colas. Una fila tiene que cumplir todos los filtros activos. El filtro de estado de claves usa dos marcas de la consulta del directorio y se lee como Listas, Aún no ha iniciado sesión o Necesita una clave compartida. El filtro de colas se compara con todas las asignaciones de la organización, no solo con las colas a las que pertenece quien consulta; cargar las asignaciones requiere el permiso Gestionar membresía de colas. [Claves de cifrado y custodia](#admin-org/keys) trata qué significan esas dos marcas. [[#permissions #keys]]
**¿Qué encuentra la búsqueda?** El navegador compara un término normalizado con los nombres que ya ha descifrado, a partir de dos caracteres. El término no sale del dispositivo. Una cuenta cuyo nombre no se puede descifrar queda excluida de los resultados y se ordena al final por nombre, de modo que un problema de claves se lee como una fila ausente y no como un error. [[#privacy #failure-states]]
**Desactivación en lote.** La desactivación en lote confirma la cantidad y la consecuencia antes de continuar. La vía en lote no envía indicador de forzado, así que una cuenta que sea la única tenedora de claves de un caso sigue activa. Se intenta cada cuenta de la selección, y el resultado indica cuáles fueron rechazadas. Desactivar una sola cuenta abre primero una confirmación y ofrece forzar el rechazo por tenencia única de claves. [Directorio de usuarios](#admin-people/people) trata qué le hace la desactivación a las claves de una cuenta. [[#failure-states #keys]]
**Las utilidades de filtrado y ordenación.** \`filterUsers\` y \`sortUsers\`, en \`packages/client/src/lib/admin/users-section-utils.ts\`, reciben una función de descifrado en vez de valores ya descifrados, lo que mantiene la comparación en el dispositivo mientras la consulta del directorio devuelve texto cifrado. [[#client-data]]`)
};

const en_xa2_demo_narrative_admin_roster_tools_body = /** @type {(inputs: Demo_Narrative_Admin_Roster_Tools_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fìltèrìng, sòrtìng ànd sèàrchìng thè ròstèr àll rùn ìn thè bròwsèr àftèr thè fùll lìst hàs lòàdèd, sò nònè òf thèm sènd sèàrch tèrms òr fìltèr sèlèctìòns tò thè sèrvèr. [[#prìvàcy #clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès èàch fìltèr sèlèct? •••••••••** Thè fìltèrs nàrròw by ròlè, àccòùnt stàtùs, kèy stàtè ànd qùèùè mèmbèrshìp. À ròw mùst sàtìsfy èvèry àctìvè fìltèr. Thè kèy stàtè fìltèr ùsès twò flàgs fròm thè ròstèr qùèry ànd rèàds às Rèàdy, Hàsn't sìgnèd ìn yèt òr Nèèds à kèy shàrè. Thè qùèùè fìltèr màtchès àgàìnst èvèry qùèùè àssìgnmènt ìn thè òrgànìzàtìòn, nòt ònly thè qùèùès thè rèàdèr bèlòngs tò; lòàdìng thè àssìgnmènts rèqùìrès thè Mànàgè qùèùè mèmbèrshìp pèrmìssìòn. [Èncryptìòn kèys ànd èscròw](#àdmìn-òrg/kèys) còvèrs whàt thè twò flàgs mèàn. [[#pèrmìssìòns #kèys]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès sèàrch màtch? •••••••** Thè bròwsèr còmpàrès à nòrmàlìzèd tèrm àgàìnst dìsplày nàmès ìt hàs àlrèàdy dècryptèd, stàrtìng àt twò chàràctèrs. Thè tèrm stàys òn thè dèvìcè. Àn àccòùnt whòsè dìsplày nàmè fàìls tò dècrypt ìs èxclùdèd fròm sèàrch rèsùlts ànd sòrtèd làst by nàmè, sò à kèy pròblèm lòòks lìkè à mìssìng ròw ràthèr thàn àn èrròr. [[#prìvàcy #fàìlùrè-stàtès]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Bùlk dèàctìvàtìòn. ••••••** Bùlk dèàctìvàtìòn cònfìrms thè còùnt ànd thè cònsèqùèncè bèfòrè pròcèèdìng. Thè bùlk pàth sènds nò fòrcè flàg, sò àn àccòùnt thàt ìs thè sòlè kèy hòldèr fòr à càsè stàys àctìvè. Èàch àccòùnt ìn thè sèlèctìòn ìs àttèmptèd, ànd thè rèsùlt rèpòrts whìch àccòùnts wèrè rèfùsèd. Dèàctìvàtìng à sìnglè àccòùnt òpèns à cònfìrmàtìòn fìrst ànd òffèrs tò fòrcè pàst thè sòlè-kèy-hòldèr rèfùsàl. [Ùsèr ròstèr](#àdmìn-pèòplè/pèòplè) còvèrs whàt dèàctìvàtìòn dòès tò àn àccòùnt's kèys. [[#fàìlùrè-stàtès #kèys]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè fìltèr ànd sòrt ùtìlìtìès. •••••••••** \`fìltèrÙsèrs\` ànd \`sòrtÙsèrs\` ìn \`pàckàgès/clìènt/src/lìb/àdmìn/ùsèrs-sèctìòn-ùtìls.ts\` àccèpt à dècryptìòn càllbàck ràthèr thàn prè-dècryptèd vàlùès, whìch kèèps thè còmpàrìsòn òn thè dèvìcè whìlè thè ròstèr qùèry rètùrns cìphèrtèxt. [[#clìènt-dàtà]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Filtering, sorting and searching the roster all run in the browser after the full list has loaded, so none of them send search terms or filter selections to ..." |
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