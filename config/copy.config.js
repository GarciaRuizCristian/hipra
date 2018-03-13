// <projectRoot>/copy.config.js
const defaultConfig = require('@ionic/app-scripts/config/copy.config');

module.exports = Object.assign({}, defaultConfig, {
	copyLogo: {
		src: 'src/assets/img/logo.png',
		dest: '{{WWW}}/img',
	},
	copyMFPcore: {
		src: ['node_modules/ibm-mfp-web-sdk/*.js'],
		dest: '{{WWW}}/assets/mfp'
	},
	copyMFPmessages: {
		src: ['node_modules/ibm-mfp-web-sdk/lib/messages/**/*.json'],
		dest: '{{WWW}}/assets/mfp/lib/messages'
	},
	copyMFPanalytics: {
		src: ['node_modules/ibm-mfp-web-sdk/lib/analytics/*.js'],
		dest: '{{WWW}}/assets/mfp/lib/analytics'
	},
	copySJCL: {
		src: ['node_modules/sjcl/*.js'],
		dest: '{{WWW}}/assets/mfp/node_modules/sjcl'
	},
	copyJSSHA: {
		src: ['node_modules/jssha/src/*.js'],
		dest: '{{WWW}}/assets/mfp/node_modules/jssha/src'
	},
	copyPromiz: {
		src: ['node_modules/promiz/*.js'],
		dest: '{{WWW}}/assets/mfp/node_modules/promiz'
	}
});