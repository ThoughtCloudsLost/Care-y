/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Roles_BodyInputs */

const en_demo_narrative_admin_roles_body = /** @type {(inputs: Demo_Narrative_Admin_Roles_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Each role has a reference page that lists the capabilities a manager or a volunteer can expect, in fixed wording that the organization's permission changes do not rewrite. [[#permissions]]
**What does the manager page report?** The page lists every active queue and the open case count of each one, whether or not the user belongs to that queue. A separate section lists the user's own queue memberships without counts. Queue names arrive as organization-key ciphertext, and a name the browser cannot decrypt is replaced with a placeholder. Opening the manager page requires the Manage users permission. [The permission system](#deep-dive/the-permission-system) covers how that gate is applied. [[#metadata #encryption #permissions]]
**What does the volunteer page report?** The page lists only the queues the user belongs to, with no case counts. A name that fails to decrypt is replaced the same way. Any signed-in user can open the volunteer page, and the page reports only that user's own data. [[#encryption #permissions #privacy]]
**Where can the text fall out of step with the grant?** The capability lines are fixed strings shipped with the application, while the permission set behind each role is editable through the matrix. An organization that has changed a role's grants still sees the original description. [Permission matrix](#admin-people/role-permissions) covers what an organization can change. [[#permissions]]
**The page components and the queries.** The manager page is \`packages/client/src/routes/(app)/admin/manager/+page.svelte\`, calling \`listQueues\` for all active queues and \`myQueues\` for the reader's own. The volunteer page is \`packages/client/src/routes/(app)/admin/volunteer/+page.svelte\`, calling \`myQueues\` only. Both endpoints sit in \`packages/server/src/routes/tickets.ts\`. [[#permissions]]`)
};

const es_demo_narrative_admin_roles_body = /** @type {(inputs: Demo_Narrative_Admin_Roles_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cada rol tiene una página de referencia que enumera las capacidades que puede esperar una persona gestora o una persona voluntaria, con texto fijo que los cambios de permisos de la organización no reescriben. [[#permissions]]
**¿Qué informa la página de gestión?** La página enumera todas las colas activas y el recuento de casos abiertos de cada una, pertenezca o no la persona usuaria a esa cola. Una sección aparte enumera las colas propias de la persona usuaria sin recuentos. Los nombres de cola llegan como texto cifrado con la clave de organización, y un nombre que el navegador no puede descifrar se reemplaza con un marcador de posición. Abrir la página de gestión requiere el permiso Gestionar usuarios. [El sistema de permisos](#deep-dive/the-permission-system) trata cómo se aplica esa restricción. [[#metadata #encryption #permissions]]
**¿Qué informa la página de voluntariado?** La página enumera solo las colas a las que pertenece la persona usuaria, sin recuentos de casos. Un nombre que no se descifra se reemplaza de la misma forma. Cualquier persona usuaria con sesión iniciada puede abrir la página de voluntariado, y la página informa solo de sus propios datos. [[#encryption #permissions #privacy]]
**¿Dónde puede el texto dejar de coincidir con la concesión?** Las líneas de capacidades son cadenas fijas distribuidas con la aplicación, mientras que el conjunto de permisos de cada rol se puede editar a través de la matriz. Una organización que ha cambiado las concesiones de un rol sigue viendo la descripción original. [Matriz de permisos](#admin-people/role-permissions) trata lo que una organización puede cambiar. [[#permissions]]
**Los componentes de página y las consultas.** La página de gestión es \`packages/client/src/routes/(app)/admin/manager/+page.svelte\`, que llama a \`listQueues\` para todas las colas activas y a \`myQueues\` para las propias. La página de voluntariado es \`packages/client/src/routes/(app)/admin/volunteer/+page.svelte\`, que llama solo a \`myQueues\`. Ambos endpoints están en \`packages/server/src/routes/tickets.ts\`. [[#permissions]]`)
};

const en_xa2_demo_narrative_admin_roles_body = /** @type {(inputs: Demo_Narrative_Admin_Roles_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èàch ròlè hàs à rèfèrèncè pàgè thàt lìsts thè càpàbìlìtìès à mànàgèr òr à vòlùntèèr càn èxpèct, ìn fìxèd wòrdìng thàt thè òrgànìzàtìòn's pèrmìssìòn chàngès dò nòt rèwrìtè. [[#pèrmìssìòns]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè mànàgèr pàgè rèpòrt? •••••••••••** Thè pàgè lìsts èvèry àctìvè qùèùè ànd thè òpèn càsè còùnt òf èàch ònè, whèthèr òr nòt thè ùsèr bèlòngs tò thàt qùèùè. À sèpàràtè sèctìòn lìsts thè ùsèr's òwn qùèùè mèmbèrshìps wìthòùt còùnts. Qùèùè nàmès àrrìvè às òrgànìzàtìòn-kèy cìphèrtèxt, ànd à nàmè thè bròwsèr cànnòt dècrypt ìs rèplàcèd wìth à plàcèhòldèr. Òpènìng thè mànàgèr pàgè rèqùìrès thè Mànàgè ùsèrs pèrmìssìòn. [Thè pèrmìssìòn systèm](#dèèp-dìvè/thè-pèrmìssìòn-systèm) còvèrs hòw thàt gàtè ìs àpplìèd. [[#mètàdàtà #èncryptìòn #pèrmìssìòns]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè vòlùntèèr pàgè rèpòrt? •••••••••••** Thè pàgè lìsts ònly thè qùèùès thè ùsèr bèlòngs tò, wìth nò càsè còùnts. À nàmè thàt fàìls tò dècrypt ìs rèplàcèd thè sàmè wày. Àny sìgnèd-ìn ùsèr càn òpèn thè vòlùntèèr pàgè, ànd thè pàgè rèpòrts ònly thàt ùsèr's òwn dàtà. [[#èncryptìòn #pèrmìssìòns #prìvàcy]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whèrè càn thè tèxt fàll òùt òf stèp wìth thè grànt? ••••••••••••••••** Thè càpàbìlìty lìnès àrè fìxèd strìngs shìppèd wìth thè àpplìcàtìòn, whìlè thè pèrmìssìòn sèt bèhìnd èàch ròlè ìs èdìtàblè thròùgh thè màtrìx. Àn òrgànìzàtìòn thàt hàs chàngèd à ròlè's grànts stìll sèès thè òrìgìnàl dèscrìptìòn. [Pèrmìssìòn màtrìx](#àdmìn-pèòplè/ròlè-pèrmìssìòns) còvèrs whàt àn òrgànìzàtìòn càn chàngè. [[#pèrmìssìòns]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè pàgè còmpònènts ànd thè qùèrìès. •••••••••••** Thè mànàgèr pàgè ìs \`pàckàgès/clìènt/src/ròùtès/(àpp)/àdmìn/mànàgèr/+pàgè.svèltè\`, càllìng \`lìstQùèùès\` fòr àll àctìvè qùèùès ànd \`myQùèùès\` fòr thè rèàdèr's òwn. Thè vòlùntèèr pàgè ìs \`pàckàgès/clìènt/src/ròùtès/(àpp)/àdmìn/vòlùntèèr/+pàgè.svèltè\`, càllìng \`myQùèùès\` ònly. Bòth èndpòìnts sìt ìn \`pàckàgès/sèrvèr/src/ròùtès/tìckèts.ts\`. [[#pèrmìssìòns]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Each role has a reference page that lists the capabilities a manager or a volunteer can expect, in fixed wording that the organization's permission changes d..." |
*
* @param {Demo_Narrative_Admin_Roles_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_roles_body = /** @type {((inputs?: Demo_Narrative_Admin_Roles_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Roles_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_roles_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_roles_body(inputs)
	return en_demo_narrative_admin_roles_body(inputs)
});