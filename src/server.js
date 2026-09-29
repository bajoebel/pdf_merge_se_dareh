require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');

const authRoutes = require('./routes/auth.routes');
const claimRoutes = require('./routes/claim.routes');
const fileManagerRoutes = require('./routes/file-manager.routes');
const visitRoutes =
    require('./routes/visit.routes');
const { requireAuth } = require('./middleware/auth.middleware');
const app = express();
app.use(
    express.json({
        limit: '10mb'
    })
);
app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    session({
        secret:
            process.env.SESSION_SECRET ||
            'development-secret',

        resave: false,

        saveUninitialized: false,

        cookie: {
            httpOnly: true,

            secure: false,

            maxAge:
                8 * 60 * 60 * 1000
        }
    })
);


// ============================================
// AUTH ROUTES
// ============================================

app.use(
    '/login',
    authRoutes
);
app.use(
    '/api/visits',
    requireAuth,
    visitRoutes
);
// ============================================
// ROOT
// ============================================

app.get(
    '/',
    (req, res) => {

        if (
            req.session &&
            req.session.authenticated
        ) {
            return res.redirect(
                '/dashboard'
            );
        }

        return res.redirect('/login');
    }
);

// ============================================
// FILE MANAGER
// ============================================

app.use(
    '/file-manager',
    requireAuth,
    express.static(
        path.join(
            process.cwd(),
            'public',
            'file-manager'
        )
    )
);
app.use(
    '/dashboard',
    requireAuth,
    express.static(
        path.join(
            process.cwd(),
            'public',
            'dashboard'
        )
    )
);


// =========================
// ROUTES
// =========================
// app.get(
//     '/',
//     (req, res) => {
//         res.json({
//             success: true,
//             message:
//                 'Claim Document Merger API'
//         });
//     }
// );
app.use(
    '/api/claims',
    claimRoutes
);
app.use(
    '/api/file-manager',
    fileManagerRoutes
);

// =========================
// SERVER
// =========================
const PORT = process.env.PORT || 3000;

const dashboardDir = path.join(
    process.cwd(),
    'public',
    'dashboard'
);

const dashboardIndex = path.join(
    dashboardDir,
    'index.html'
);

// Dashboard routes
app.get(
    '/dashboard',
    requireAuth,
    (req, res) => {
        res.sendFile(dashboardIndex);
    }
);

app.get(
    '/dashboard/visits',
    requireAuth,
    (req, res) => {
        res.sendFile(dashboardIndex);
    }
);

app.get(
    '/dashboard/visits/detail',
    requireAuth,
    (req, res) => {
        res.sendFile(dashboardIndex);
    }
);

app.get(
    '/dashboard/file-manager',
    requireAuth,
    (req, res) => {
        res.sendFile(dashboardIndex);
    }
);

// Static assets dashboard
app.use(
    '/dashboard',
    requireAuth,
    express.static(dashboardDir)
);
app.listen(
    PORT,
    () => {
        console.log(
            `Server running at http://localhost:${PORT}`
        );
    }
);