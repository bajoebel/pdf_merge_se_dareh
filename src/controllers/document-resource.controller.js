const documentResourceService = require('../services/document-resource.service');

async function getDocumentResources(req, res) {
    try {
        const service = String(req.query.service || '')
            .trim()
            .toUpperCase();

        if (!service) {
            return res.status(400).json({
                success: false,
                message: 'Parameter service wajib diisi.',
                data: []
            });
        }

        const allowedServices = ['RAJAL', 'RANAP'];

        if (!allowedServices.includes(service)) {
            return res.status(400).json({
                success: false,
                message: 'Parameter service tidak valid.',
                data: []
            });
        }

        const resources =
            await documentResourceService.getDocumentResources(service);

        return res.json({
            success: true,
            message: 'Data document resources berhasil diambil.',
            service: service,
            count: resources.length,
            data: resources
        });

    } catch (error) {
        console.error(
            '[getDocumentResources]',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil document resources.',
            data: []
        });
    }
}

module.exports = {
    getDocumentResources
};