/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Queues_BodyInputs */

const en_demo_narrative_admin_queues_body = /** @type {(inputs: Demo_Narrative_Admin_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Creating a queue, ordering the list and deciding who belongs to it are three separate permissions, and an account can hold any one of them without the others. [[#permissions]]
**What creating one writes.** The browser encrypts the name, the color and the icon under the organization key before the request leaves, and the server appends the row after the current highest sort order and stamps it with the organization key generation in force. [Queue overview](#dashboard/queues) covers the columns a queue row keeps in plaintext. [[#encryption]]
**Reordering and deleting.** A move renumbers the whole list inside one transaction, in two passes, because no two queues may share a position. Deleting refuses while only one queue is left, and refuses while the queue still holds cases until another queue is named to receive them, after which the membership rows and the notification rows go with it. [[#metadata #failure-states]]
**What membership grants and what removing it leaves.** Adding an account to a queue gives it access to every case in that queue, which is the widest single grant in the permission set and the reason it carries its own key. Removing the account deletes the assignment row, and the ticket key wraps minted for that account while it was a member stay on those cases. [The permission system](#deep-dive/the-permission-system) covers how that access is checked. [[#permissions #keys]]
**How a new member comes to read the queue.** Membership grants access and issues no keys. A browser that already holds the case keys asks for cases in its own queues that are missing wraps for an active member, mints one wrap per case against that member's public key and submits them, which runs as a sweep after sign-in, so a new member has access to a case before their device has anything to open it with. [[#keys #encryption]]
**The queue that catches an intake form.** A submitted intake form goes to the queue its form names, and to the organization's intake queue when the form names none, and setting that fallback is a channel routing permission rather than a queue permission. The choice is stored as a plain queue id on the organization's configuration row. [Intake forms list](#admin-org/intake-forms) covers where a form names its own destination. [[#metadata #permissions]]`)
};

const es_demo_narrative_admin_queues_body = /** @type {(inputs: Demo_Narrative_Admin_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Crear una cola, ordenar la lista y decidir quién pertenece a ella son tres permisos distintos, y una cuenta puede tener cualquiera de ellos sin los demás. [[#permissions]]
**Lo que escribe la creación.** El navegador cifra el nombre, el color y el icono con la clave de la organización antes de que salga la petición, y el servidor añade la fila después del orden más alto que haya y la marca con la generación de la clave de la organización vigente. [Vista general de colas](#dashboard/queues) trata las columnas que una fila de cola guarda en texto plano. [[#encryption]]
**Reordenar y eliminar.** Un movimiento renumera la lista entera dentro de una transacción, en dos pasadas, porque dos colas no pueden compartir posición. La eliminación se rechaza mientras queda una sola cola, y se rechaza mientras la cola todavía tiene casos hasta que se nombra otra cola que los reciba, tras lo cual las filas de pertenencia y las de notificación se van con ella. [[#metadata #failure-states]]
**Qué concede la pertenencia y qué deja al quitarla.** Agregar una cuenta a una cola le da acceso a todos los casos de esa cola, que es la concesión individual más amplia del conjunto de permisos y la razón de que tenga clave propia. Quitar la cuenta borra la fila de asignación, y los envoltorios de clave de ticket creados para esa cuenta mientras era miembro siguen en esos casos. [El sistema de permisos](#deep-dive/the-permission-system) explica cómo se comprueba ese acceso. [[#permissions #keys]]
**Cómo llega un miembro nuevo a leer la cola.** La pertenencia concede acceso y no entrega claves. Un navegador que ya tiene las claves de los casos pide los casos de sus propias colas a los que les falta un envoltorio para un miembro activo, crea un envoltorio por caso con la clave pública de ese miembro y los envía, y eso ocurre como un barrido después de iniciar sesión, así que un miembro nuevo tiene acceso a un caso antes de que su dispositivo tenga con qué abrirlo. [[#keys #encryption]]
**La cola que recoge un formulario de admisión.** Un formulario de admisión enviado va a la cola que indica su formulario, y a la cola de admisión de la organización cuando el formulario no indica ninguna, y fijar ese valor de respaldo es un permiso de enrutamiento de canales y no un permiso de colas. La elección se guarda como un identificador de cola en texto plano en la fila de configuración de la organización. [Lista de formularios de admisión](#admin-org/intake-forms) trata dónde un formulario indica su propio destino. [[#metadata #permissions]]`)
};

const en_xa2_demo_narrative_admin_queues_body = /** @type {(inputs: Demo_Narrative_Admin_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Crèàtìng à qùèùè, òrdèrìng thè lìst ànd dècìdìng whò bèlòngs tò ìt àrè thrèè sèpàràtè pèrmìssìòns, ànd àn àccòùnt càn hòld àny ònè òf thèm wìthòùt thè òthèrs. [[#pèrmìssìòns]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt crèàtìng ònè wrìtès. ••••••••** Thè bròwsèr èncrypts thè nàmè, thè còlòr ànd thè ìcòn ùndèr thè òrgànìzàtìòn kèy bèfòrè thè rèqùèst lèàvès, ànd thè sèrvèr àppènds thè ròw àftèr thè cùrrènt hìghèst sòrt òrdèr ànd stàmps ìt wìth thè òrgànìzàtìòn kèy gènèràtìòn ìn fòrcè. [Qùèùè òvèrvìèw](#dàshbòàrd/qùèùès) còvèrs thè còlùmns à qùèùè ròw kèèps ìn plàìntèxt. [[#èncryptìòn]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Rèòrdèrìng ànd dèlètìng. ••••••••** À mòvè rènùmbèrs thè whòlè lìst ìnsìdè ònè trànsàctìòn, ìn twò pàssès, bècàùsè nò twò qùèùès mày shàrè à pòsìtìòn. Dèlètìng rèfùsès whìlè ònly ònè qùèùè ìs lèft, ànd rèfùsès whìlè thè qùèùè stìll hòlds càsès ùntìl ànòthèr qùèùè ìs nàmèd tò rècèìvè thèm, àftèr whìch thè mèmbèrshìp ròws ànd thè nòtìfìcàtìòn ròws gò wìth ìt. [[#mètàdàtà #fàìlùrè-stàtès]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt mèmbèrshìp grànts ànd whàt rèmòvìng ìt lèàvès. ••••••••••••••••** Àddìng àn àccòùnt tò à qùèùè gìvès ìt àccèss tò èvèry càsè ìn thàt qùèùè, whìch ìs thè wìdèst sìnglè grànt ìn thè pèrmìssìòn sèt ànd thè rèàsòn ìt càrrìès ìts òwn kèy. Rèmòvìng thè àccòùnt dèlètès thè àssìgnmènt ròw, ànd thè tìckèt kèy wràps mìntèd fòr thàt àccòùnt whìlè ìt wàs à mèmbèr stày òn thòsè càsès. [Thè pèrmìssìòn systèm](#dèèp-dìvè/thè-pèrmìssìòn-systèm) còvèrs hòw thàt àccèss ìs chèckèd. [[#pèrmìssìòns #kèys]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Hòw à nèw mèmbèr còmès tò rèàd thè qùèùè. •••••••••••••** Mèmbèrshìp grànts àccèss ànd ìssùès nò kèys. À bròwsèr thàt àlrèàdy hòlds thè càsè kèys àsks fòr càsès ìn ìts òwn qùèùès thàt àrè mìssìng wràps fòr àn àctìvè mèmbèr, mìnts ònè wràp pèr càsè àgàìnst thàt mèmbèr's pùblìc kèy ànd sùbmìts thèm, whìch rùns às à swèèp àftèr sìgn-ìn, sò à nèw mèmbèr hàs àccèss tò à càsè bèfòrè thèìr dèvìcè hàs ànythìng tò òpèn ìt wìth. [[#kèys #èncryptìòn]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè qùèùè thàt càtchès àn ìntàkè fòrm. ••••••••••••** À sùbmìttèd ìntàkè fòrm gòès tò thè qùèùè ìts fòrm nàmès, ànd tò thè òrgànìzàtìòn's ìntàkè qùèùè whèn thè fòrm nàmès nònè, ànd sèttìng thàt fàllbàck ìs à chànnèl ròùtìng pèrmìssìòn ràthèr thàn à qùèùè pèrmìssìòn. Thè chòìcè ìs stòrèd às à plàìn qùèùè ìd òn thè òrgànìzàtìòn's cònfìgùràtìòn ròw. [Ìntàkè fòrms lìst](#àdmìn-òrg/ìntàkè-fòrms) còvèrs whèrè à fòrm nàmès ìts òwn dèstìnàtìòn. [[#mètàdàtà #pèrmìssìòns]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Creating a queue, ordering the list and deciding who belongs to it are three separate permissions, and an account can hold any one of them without the others..." |
*
* @param {Demo_Narrative_Admin_Queues_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_queues_body = /** @type {((inputs?: Demo_Narrative_Admin_Queues_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Queues_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_queues_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_queues_body(inputs)
	return en_demo_narrative_admin_queues_body(inputs)
});