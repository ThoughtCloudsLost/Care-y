/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_BodyInputs */

const en_demo_narrative_topic_twofa_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`For any account that has a second factor enrolled, the browser derives encryption keys only after that factor is verified. An account signing in for the first time derives its keys and then must enroll a method before anything else opens. An attacker who has the password but not the second factor cannot obtain key material. [[#keys #encryption]]
**Supported methods.** Any number can be active at once. Each works on its own. [[#privacy]]
- [Passkeys and security keys](#login/passkey) are device-bound and cannot be used from another device. [[#keys]]
- [Authenticator app codes](#login/totp) generate six-digit codes offline. [[#privacy]]
- [Email codes](#login/email) and [Text message codes](#login/sms) are delivered to an address or number the server can read. [[#server-holds #telephony]]
- [Push approval](#login/push) sends a prompt to an installed app. [[#privacy]]
- [Backup codes](#login/backup-codes) are one-time codes generated when the first method is enrolled. [[#failure-states]]
**Security differences between methods.** Passkeys and security keys are the strongest option because nothing is typed or sent through a channel that can be stolen or phished. Codes sent by text message can be stolen by taking over the phone number or intercepting the phone network. Codes sent by email are only as safe as the email inbox. Any typed code can be captured in real time by a fake site that asks for it and passes it along. Authenticator-app codes are not exempt. [[#keys #trust-boundary]]
**Mandatory enrollment.** New accounts must enroll a second factor at first sign-in. No part of the app opens until enrollment finishes. Removing the last active method is refused. [[#failure-states #permissions]]
**Plaintext in the enrollment row.** The account, method name, and active flag are stored in plaintext. A database dump shows which accounts use which type of second factor. Method secrets are stored in encrypted columns. Backup codes are stored only as hashes. [The trust boundary](#deep-dive/the-trust-boundary) covers what else is plaintext in the schema. [[#metadata #server-holds]]
**IP change re-verification.** The session records whether the second factor has been verified. A request from a different IP than the one that opened the session clears that flag. The next request requires the second factor again without ending the session or discarding unsaved work. [What the network sees](#deep-dive/what-the-network-sees) covers what the server stores about IP addresses. [[#failure-states #privacy]]
**Two-factor setup and enforcement code.** Registration, challenge, and verification logic is in \`packages/server/src/auth/two-factor-service.ts\` behind the routes in \`packages/server/src/routes/two-factor.ts\`. The method table is \`packages/server/src/db/migrations/tenant/010_create_two_factor_methods.ts\`. The session flag is in \`005_add_session_2fa.ts\`. The challenge renders inline on the login page via \`packages/client/src/lib/components/auth/TwoFactorChallenge.svelte\`. [[#permissions #server-holds]]`)
};

const es_demo_narrative_topic_twofa_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Para cualquier cuenta que tenga un segundo factor inscrito, el navegador deriva las claves de cifrado solo tras verificar ese factor. Una cuenta que inicia sesión por primera vez deriva sus claves y después debe inscribir un método antes de que se abra cualquier otra cosa. Un atacante que tenga la contraseña pero no el segundo factor no puede obtener material de claves. [[#keys #encryption]]
**Métodos admitidos.** Se puede tener activo cualquier número a la vez. Cada uno funciona por separado. [[#privacy]]
- [Passkeys y llaves de seguridad](#login/passkey) están vinculadas al dispositivo y no se pueden usar desde otro. [[#keys]]
- [Códigos de aplicación de autenticación](#login/totp) generan códigos de seis dígitos sin conexión. [[#privacy]]
- [Códigos por correo](#login/email) y [Códigos por mensaje de texto](#login/sms) se entregan a una dirección o número que el servidor puede leer. [[#server-holds #telephony]]
- [Aprobación push](#login/push) envía una solicitud a una aplicación instalada. [[#privacy]]
- [Códigos de respaldo](#login/backup-codes) son códigos de un solo uso que se generan al inscribir el primer método. [[#failure-states]]
**Diferencias de seguridad entre métodos.** Las passkeys y las llaves de seguridad son la opción más segura porque nada se escribe ni se envía por un canal que pueda ser robado o suplantado. Los códigos enviados por mensaje de texto pueden ser robados al tomar control del número de teléfono o al interceptar la red telefónica. Los códigos enviados por correo electrónico son tan seguros como la bandeja de entrada. Cualquier código escrito puede ser capturado en tiempo real por un sitio falso que lo solicita y lo reenvía. Los códigos de aplicaciones de autenticación no son una excepción. [[#keys #trust-boundary]]
**Inscripción obligatoria.** Las cuentas nuevas deben inscribir un segundo factor en el primer inicio de sesión. Ninguna parte de la aplicación se abre hasta que la inscripción termine. Eliminar el último método activo se rechaza. [[#failure-states #permissions]]
**Texto plano en la fila de inscripción.** La cuenta, el nombre del método y la marca de activo se guardan en texto plano. Un volcado de la base de datos muestra qué cuentas usan qué tipo de segundo factor. Los secretos de cada método se guardan en columnas cifradas. Los códigos de respaldo se guardan solo como hashes. [La frontera de confianza](#deep-dive/the-trust-boundary) trata qué más hay en texto plano en el esquema. [[#metadata #server-holds]]
**Reverificación por cambio de IP.** La sesión registra si el segundo factor ha sido verificado. Una solicitud desde una IP distinta de la que abrió la sesión borra esa marca. La siguiente solicitud exige el segundo factor de nuevo sin cerrar la sesión ni descartar el trabajo no guardado. [Lo que ve la red](#deep-dive/what-the-network-sees) trata lo que el servidor almacena sobre las direcciones IP. [[#failure-states #privacy]]
**Código de configuración y aplicación del segundo factor.** La lógica de registro, desafío y verificación está en \`packages/server/src/auth/two-factor-service.ts\`, detrás de las rutas de \`packages/server/src/routes/two-factor.ts\`. La tabla de métodos es \`packages/server/src/db/migrations/tenant/010_create_two_factor_methods.ts\`. La marca de sesión está en \`005_add_session_2fa.ts\`. El desafío se presenta dentro de la página de inicio de sesión mediante \`packages/client/src/lib/components/auth/TwoFactorChallenge.svelte\`. [[#permissions #server-holds]]`)
};

const en_xa2_demo_narrative_topic_twofa_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fòr àny àccòùnt thàt hàs à sècònd fàctòr ènròllèd, thè bròwsèr dèrìvès èncryptìòn kèys ònly àftèr thàt fàctòr ìs vèrìfìèd. Àn àccòùnt sìgnìng ìn fòr thè fìrst tìmè dèrìvès ìts kèys ànd thèn mùst ènròll à mèthòd bèfòrè ànythìng èlsè òpèns. Àn àttàckèr whò hàs thè pàsswòrd bùt nòt thè sècònd fàctòr cànnòt òbtàìn kèy màtèrìàl. [[#kèys #èncryptìòn]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Sùppòrtèd mèthòds. ••••••** Àny nùmbèr càn bè àctìvè àt òncè. Èàch wòrks òn ìts òwn. [[#prìvàcy]]
- [Pàsskèys ànd sècùrìty kèys](#lògìn/pàsskèy) àrè dèvìcè-bòùnd ànd cànnòt bè ùsèd fròm ànòthèr dèvìcè. [[#kèys]]
- [Àùthèntìcàtòr àpp còdès](#lògìn/tòtp) gènèràtè sìx-dìgìt còdès òfflìnè. [[#prìvàcy]]
- [Èmàìl còdès](#lògìn/èmàìl) ànd [Tèxt mèssàgè còdès](#lògìn/sms) àrè dèlìvèrèd tò àn àddrèss òr nùmbèr thè sèrvèr càn rèàd. [[#sèrvèr-hòlds #tèlèphòny]]
- [Pùsh àppròvàl](#lògìn/pùsh) sènds à pròmpt tò àn ìnstàllèd àpp. [[#prìvàcy]]
- [Bàckùp còdès](#lògìn/bàckùp-còdès) àrè ònè-tìmè còdès gènèràtèd whèn thè fìrst mèthòd ìs ènròllèd. [[#fàìlùrè-stàtès]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Sècùrìty dìffèrèncès bètwèèn mèthòds. ••••••••••••** Pàsskèys ànd sècùrìty kèys àrè thè stròngèst òptìòn bècàùsè nòthìng ìs typèd òr sènt thròùgh à chànnèl thàt càn bè stòlèn òr phìshèd. Còdès sènt by tèxt mèssàgè càn bè stòlèn by tàkìng òvèr thè phònè nùmbèr òr ìntèrcèptìng thè phònè nètwòrk. Còdès sènt by èmàìl àrè ònly às sàfè às thè èmàìl ìnbòx. Àny typèd còdè càn bè càptùrèd ìn rèàl tìmè by à fàkè sìtè thàt àsks fòr ìt ànd pàssès ìt àlòng. Àùthèntìcàtòr-àpp còdès àrè nòt èxèmpt. [[#kèys #trùst-bòùndàry]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Màndàtòry ènròllmènt. •••••••** Nèw àccòùnts mùst ènròll à sècònd fàctòr àt fìrst sìgn-ìn. Nò pàrt òf thè àpp òpèns ùntìl ènròllmènt fìnìshès. Rèmòvìng thè làst àctìvè mèthòd ìs rèfùsèd. [[#fàìlùrè-stàtès #pèrmìssìòns]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Plàìntèxt ìn thè ènròllmènt ròw. ••••••••••** Thè àccòùnt, mèthòd nàmè, ànd àctìvè flàg àrè stòrèd ìn plàìntèxt. À dàtàbàsè dùmp shòws whìch àccòùnts ùsè whìch typè òf sècònd fàctòr. Mèthòd sècrèts àrè stòrèd ìn èncryptèd còlùmns. Bàckùp còdès àrè stòrèd ònly às hàshès. [Thè trùst bòùndàry](#dèèp-dìvè/thè-trùst-bòùndàry) còvèrs whàt èlsè ìs plàìntèxt ìn thè schèmà. [[#mètàdàtà #sèrvèr-hòlds]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**ÌP chàngè rè-vèrìfìcàtìòn. ••••••••** Thè sèssìòn rècòrds whèthèr thè sècònd fàctòr hàs bèèn vèrìfìèd. À rèqùèst fròm à dìffèrènt ÌP thàn thè ònè thàt òpènèd thè sèssìòn clèàrs thàt flàg. Thè nèxt rèqùèst rèqùìrès thè sècònd fàctòr àgàìn wìthòùt èndìng thè sèssìòn òr dìscàrdìng ùnsàvèd wòrk. [Whàt thè nètwòrk sèès](#dèèp-dìvè/whàt-thè-nètwòrk-sèès) còvèrs whàt thè sèrvèr stòrès àbòùt ÌP àddrèssès. [[#fàìlùrè-stàtès #prìvàcy]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Twò-fàctòr sètùp ànd ènfòrcèmènt còdè. ••••••••••••** Règìstràtìòn, chàllèngè, ànd vèrìfìcàtìòn lògìc ìs ìn \`pàckàgès/sèrvèr/src/àùth/twò-fàctòr-sèrvìcè.ts\` bèhìnd thè ròùtès ìn \`pàckàgès/sèrvèr/src/ròùtès/twò-fàctòr.ts\`. Thè mèthòd tàblè ìs \`pàckàgès/sèrvèr/src/db/mìgràtìòns/tènànt/010_crèàtè_twò_fàctòr_mèthòds.ts\`. Thè sèssìòn flàg ìs ìn \`005_àdd_sèssìòn_2fà.ts\`. Thè chàllèngè rèndèrs ìnlìnè òn thè lògìn pàgè vìà \`pàckàgès/clìènt/src/lìb/còmpònènts/àùth/TwòFàctòrChàllèngè.svèltè\`. [[#pèrmìssìòns #sèrvèr-hòlds]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "For any account that has a second factor enrolled, the browser derives encryption keys only after that factor is verified. An account signing in for the firs..." |
*
* @param {Demo_Narrative_Topic_Twofa_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_body = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_twofa_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_twofa_body(inputs)
	return en_demo_narrative_topic_twofa_body(inputs)
});