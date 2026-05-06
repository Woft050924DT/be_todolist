"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCategories = getAllCategories;
exports.getCategory = getCategory;
exports.addCategory = addCategory;
exports.editCategory = editCategory;
exports.removeCategory = removeCategory;
const categoryService_1 = __importDefault(require("../services/categoryService"));
function parseCategoryId(id) {
    if (Array.isArray(id)) {
        return null;
    }
    const categoryId = Number(id);
    return Number.isInteger(categoryId) && categoryId > 0 ? categoryId : null;
}
function getAllCategories(req, res) {
    categoryService_1.default.get(res);
}
function getCategory(req, res) {
    const id = parseCategoryId(req.params.id);
    if (!id) {
        return res.status(400).json({ status: 1, message: "Invalid category id" });
    }
    categoryService_1.default.getByID(id, res);
}
function addCategory(req, res) {
    categoryService_1.default.create(req.body, res);
}
function editCategory(req, res) {
    const id = parseCategoryId(req.params.id);
    if (!id) {
        return res.status(400).json({ status: 1, message: "Invalid category id" });
    }
    categoryService_1.default.update(req.body, id, res);
}
function removeCategory(req, res) {
    const id = parseCategoryId(req.params.id);
    if (!id) {
        return res.status(400).json({ status: 1, message: "Invalid category id" });
    }
    categoryService_1.default.delete(id, res);
}
