const path = require('path');
module.exports = {
    port: process.env.PORT || 3000,
    storage: {
        claimPath: path.join(
            process.cwd(),
            'storage',
            'claims'
        ),
        tempPath: path.join(
            process.cwd(),
            'temp'
        )
    }
};