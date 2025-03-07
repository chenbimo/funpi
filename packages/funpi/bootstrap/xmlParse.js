import fp from 'fastify-plugin';
import { XMLParser, XMLValidator } from 'fast-xml-parser';

async function plugin(fastify) {
    const opts = {
        contentType: ['text/xml', 'application/xml', 'application/rss+xml'],
        validate: false
    };

    function contentParser(req, payload, done) {
        const xmlParser = new XMLParser(opts);
        const parsingOpts = opts;

        let body = '';
        payload.on('error', errorListener);
        payload.on('data', dataListener);
        payload.on('end', endListener);

        function errorListener(err) {
            done(err);
        }
        function endListener() {
            if (parsingOpts.validate) {
                const result = XMLValidator.validate(body, parsingOpts);
                if (result.err) {
                    const invalidFormat = new Error('Invalid Format: ' + result.err.msg);
                    invalidFormat.statusCode = 400;
                    payload.removeListener('error', errorListener);
                    payload.removeListener('data', dataListener);
                    payload.removeListener('end', endListener);
                    done(invalidFormat);
                } else {
                    handleParseXml(body);
                }
            } else {
                handleParseXml(body);
            }
        }
        function dataListener(data) {
            body = body + data;
        }
        function handleParseXml(body) {
            try {
                done(null, xmlParser.parse(body));
            } catch (err) {
                done(err);
            }
        }
    }

    fastify.addContentTypeParser(opts.contentType, contentParser);
}

export default fp(plugin, {
    name: 'funpiXmlParse'
});
