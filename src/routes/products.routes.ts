// src/routes/products.routes.ts
import { Router } from 'express';
import multer from 'multer';
import { 
    getProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    getActiveProducts,
    toggleProductStatus,
    importProductsCSV
} from '../controllers/products.controller';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware'; 

const router = Router();
const uploadRAM = multer({ storage: multer.memoryStorage() });

// RUTAS GENERALES
router.get('/', getProducts);
router.get('/active', getActiveProducts);

// RUTAS ADMIN
// Importante: /import/csv va antes de /:id para que Express no se confunda
router.post('/import/csv', verifyToken, isAdmin, uploadRAM.single('file'), importProductsCSV);

router.post('/', verifyToken, isAdmin, upload.single('image'), createProduct);
router.get('/:id', getProductById);
router.put('/:id', verifyToken, isAdmin, upload.single('image'), updateProduct);
router.delete('/:id', verifyToken, isAdmin, deleteProduct);
router.patch('/:id/toggle', verifyToken, isAdmin, toggleProductStatus);

export default router;