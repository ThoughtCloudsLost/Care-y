/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Drawer_BodyInputs */

const en_demo_narrative_client_drawer_body = /** @type {(inputs: Demo_Narrative_Client_Drawer_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The drawer opens from the identity button on every client page. It shows the organization's name and logo. The header identifies the organization, not the person. [[#portal]]
**Which actions appear?** The drawer lists actions that belong to the current page. On a bare secure link the action is "Make your messages more secure." On a passphrase-protected link the actions are "Your contact info" and "Create an account." While the thread is showing, "Correct my contact info" is added. On the account page, when signed in, the actions are "Your contact info", "Correct my contact info", "Account settings", and "Sign out." Without a sign-in the account page has no actions. The intake form, the privacy notice, and a share link have no actions, so the drawer shows only the header, the theme toggle, and the privacy notice link. [Account upgrade](#client-portal/account-upgrade) covers what each upgrade path does. [[#portal]]
**Theme toggle.** A toggle switches between light and dark mode without closing the drawer. [[#portal]]
**Privacy notice.** A link at the foot of the drawer opens the privacy notice. The link is hidden when the client is already on that page. [Privacy notice](#client-privacy/notice) covers what the notice states. [[#portal #privacy]]
**What is not in the drawer?** Quick exit stays in the navbar on every client page, independent of the drawer. The language picker is also in the navbar. [Quick exit](#client-portal/quick-exit) covers what the control clears and what it leaves behind. [[#portal #privacy]]
**Signing out from the account page.** Signing out wipes the keys in the browser first, then ends the server session. The page shows a voluntary sign-out confirmation distinct from the idle timeout message. [Sign out](#client-account/sign-out) covers what sign-out does and does not hide. [[#keys #portal]]
**The drawer component and the action contract.** \`ClientDrawer.svelte\` in \`packages/client/src/lib/client-shell/\` renders once inside \`ClientShell.svelte\`. Each client page registers its actions through the shell context in \`packages/client/src/lib/client-shell/context.ts\`. Tapping an action closes the drawer and runs the action's callback. [[#client-data #portal]]`)
};

const es_demo_narrative_client_drawer_body = /** @type {(inputs: Demo_Narrative_Client_Drawer_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El panel lateral se abre desde el botón de identidad en todas las páginas del cliente. Muestra el nombre y el logotipo de la organización. El encabezado identifica a la organización, no a la persona. [[#portal]]
**¿Qué acciones aparecen?** El panel lista las acciones que corresponden a la página actual. En un enlace seguro sin protección la acción es "Haz tus mensajes más seguros." En un enlace con frase de acceso las acciones son "Tu información de contacto" y "Crear una cuenta." Mientras el hilo está visible se añade "Corregir mi información de contacto." En la página de cuenta, con sesión iniciada, las acciones son "Tu información de contacto", "Corregir mi información de contacto", "Configuración de cuenta" y "Cerrar sesión." Sin sesión iniciada la página de cuenta no tiene acciones. El formulario de ingreso, el aviso de privacidad y un enlace compartido no tienen acciones, por lo que el panel muestra solo el encabezado, el selector de tema y el enlace al aviso de privacidad. [Mejora de cuenta](#client-portal/account-upgrade) trata lo que cada opción de mejora hace. [[#portal]]
**Selector de tema.** Un control alterna entre modo claro y modo oscuro sin cerrar el panel. [[#portal]]
**Aviso de privacidad.** Un enlace al pie del panel abre el aviso de privacidad. El enlace se oculta cuando el cliente ya está en esa página. [Aviso de privacidad](#client-privacy/notice) trata lo que el aviso indica. [[#portal #privacy]]
**¿Qué no está en el panel?** La salida rápida permanece en la barra de navegación de todas las páginas del cliente, independiente del panel. El selector de idioma también está en la barra de navegación. [Salida rápida](#client-portal/quick-exit) trata lo que el control borra y lo que deja. [[#portal #privacy]]
**Cierre de sesión desde la página de cuenta.** Al cerrar sesión se borran las claves en el navegador primero y luego se finaliza la sesión en el servidor. La página muestra una confirmación de cierre voluntario distinta del mensaje de tiempo de inactividad. [Cierre de sesión](#client-account/sign-out) trata lo que el cierre de sesión oculta y lo que no. [[#keys #portal]]
**El componente y el contrato de acciones.** \`ClientDrawer.svelte\` en \`packages/client/src/lib/client-shell/\` se monta una vez dentro de \`ClientShell.svelte\`. Cada página del cliente registra sus acciones a través del contexto del shell en \`packages/client/src/lib/client-shell/context.ts\`. Al pulsar una acción se cierra el panel y se ejecuta el callback de la acción. [[#client-data #portal]]`)
};

const en_xa2_demo_narrative_client_drawer_body = /** @type {(inputs: Demo_Narrative_Client_Drawer_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè dràwèr òpèns fròm thè ìdèntìty bùttòn òn èvèry clìènt pàgè. Ìt shòws thè òrgànìzàtìòn's nàmè ànd lògò. Thè hèàdèr ìdèntìfìès thè òrgànìzàtìòn, nòt thè pèrsòn. [[#pòrtàl]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••**Whìch àctìòns àppèàr? •••••••** Thè dràwèr lìsts àctìòns thàt bèlòng tò thè cùrrènt pàgè. Òn à bàrè sècùrè lìnk thè àctìòn ìs "Màkè yòùr mèssàgès mòrè sècùrè." Òn à pàssphràsè-pròtèctèd lìnk thè àctìòns àrè "Yòùr còntàct ìnfò" ànd "Crèàtè àn àccòùnt." Whìlè thè thrèàd ìs shòwìng, "Còrrèct my còntàct ìnfò" ìs àddèd. Òn thè àccòùnt pàgè, whèn sìgnèd ìn, thè àctìòns àrè "Yòùr còntàct ìnfò", "Còrrèct my còntàct ìnfò", "Àccòùnt sèttìngs", ànd "Sìgn òùt." Wìthòùt à sìgn-ìn thè àccòùnt pàgè hàs nò àctìòns. Thè ìntàkè fòrm, thè prìvàcy nòtìcè, ànd à shàrè lìnk hàvè nò àctìòns, sò thè dràwèr shòws ònly thè hèàdèr, thè thèmè tògglè, ànd thè prìvàcy nòtìcè lìnk. [Àccòùnt ùpgràdè](#clìènt-pòrtàl/àccòùnt-ùpgràdè) còvèrs whàt èàch ùpgràdè pàth dòès. [[#pòrtàl]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thèmè tògglè. ••••** À tògglè swìtchès bètwèèn lìght ànd dàrk mòdè wìthòùt clòsìng thè dràwèr. [[#pòrtàl]]
 •••••••••••••••••••••••••••**Prìvàcy nòtìcè. •••••** À lìnk àt thè fòòt òf thè dràwèr òpèns thè prìvàcy nòtìcè. Thè lìnk ìs hìddèn whèn thè clìènt ìs àlrèàdy òn thàt pàgè. [Prìvàcy nòtìcè](#clìènt-prìvàcy/nòtìcè) còvèrs whàt thè nòtìcè stàtès. [[#pòrtàl #prìvàcy]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt ìs nòt ìn thè dràwèr? ••••••••** Qùìck èxìt stàys ìn thè nàvbàr òn èvèry clìènt pàgè, ìndèpèndènt òf thè dràwèr. Thè làngùàgè pìckèr ìs àlsò ìn thè nàvbàr. [Qùìck èxìt](#clìènt-pòrtàl/qùìck-èxìt) còvèrs whàt thè còntròl clèàrs ànd whàt ìt lèàvès bèhìnd. [[#pòrtàl #prìvàcy]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Sìgnìng òùt fròm thè àccòùnt pàgè. •••••••••••** Sìgnìng òùt wìpès thè kèys ìn thè bròwsèr fìrst, thèn ènds thè sèrvèr sèssìòn. Thè pàgè shòws à vòlùntàry sìgn-òùt cònfìrmàtìòn dìstìnct fròm thè ìdlè tìmèòùt mèssàgè. [Sìgn òùt](#clìènt-àccòùnt/sìgn-òùt) còvèrs whàt sìgn-òùt dòès ànd dòès nòt hìdè. [[#kèys #pòrtàl]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè dràwèr còmpònènt ànd thè àctìòn còntràct. ••••••••••••••** \`ClìèntDràwèr.svèltè\` ìn \`pàckàgès/clìènt/src/lìb/clìènt-shèll/\` rèndèrs òncè ìnsìdè \`ClìèntShèll.svèltè\`. Èàch clìènt pàgè règìstèrs ìts àctìòns thròùgh thè shèll còntèxt ìn \`pàckàgès/clìènt/src/lìb/clìènt-shèll/còntèxt.ts\`. Tàppìng àn àctìòn clòsès thè dràwèr ànd rùns thè àctìòn's càllbàck. [[#clìènt-dàtà #pòrtàl]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The drawer opens from the identity button on every client page. It shows the organization's name and logo. The header identifies the organization, not the pe..." |
*
* @param {Demo_Narrative_Client_Drawer_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_drawer_body = /** @type {((inputs?: Demo_Narrative_Client_Drawer_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Drawer_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_drawer_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_drawer_body(inputs)
	return en_demo_narrative_client_drawer_body(inputs)
});