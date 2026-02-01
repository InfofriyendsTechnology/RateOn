import { Router } from 'express';
import { 
    createReport, 
    getReports, 
    getReportById, 
    resolveReport, 
    rejectReport,
    getReportStats
} from '../controllers/reportController/index.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';

const router = Router();

// User routes - authenticated users can create reports
router.post('/', auth, createReport);

// Admin routes - only admins can manage reports
router.get('/', auth, authorize(['admin']), getReports);
router.get('/stats', auth, authorize(['admin']), getReportStats);
router.get('/:id', auth, authorize(['admin']), getReportById);
router.put('/:id/resolve', auth, authorize(['admin']), resolveReport);
router.put('/:id/reject', auth, authorize(['admin']), rejectReport);

export default router;





