"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDatabase = validateDatabase;
var db_1 = require("@/lib/db");
var inventory_repository_1 = require("../server/repositories/inventory.repository");
/**
 * Validates the core DB transactional workflows using Prisma CRUD operations.
 * Must be executed to verify Phase 3 DB architecture matches requirements.
 */
function validateDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var inventory, hasStock, updatedInventory, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Starting DB Validation...");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 9, 10, 12]);
                    // Note: To run this test, the database must be seeded with mock data.
                    // Ensure all Phase 3 tables exist and constraints are working.
                    // Test connection
                    return [4 /*yield*/, db_1.prisma.$queryRaw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["SELECT 1"], ["SELECT 1"])))];
                case 2:
                    // Note: To run this test, the database must be seeded with mock data.
                    // Ensure all Phase 3 tables exist and constraints are working.
                    // Test connection
                    _a.sent();
                    console.log("✅ Connection successful.");
                    return [4 /*yield*/, db_1.prisma.inventory.create({
                            data: {
                                sanityProductId: "test_product_123",
                                availableStock: 10,
                                reservedStock: 0,
                                lowStockThreshold: 2,
                            }
                        })];
                case 3:
                    inventory = _a.sent();
                    console.log("✅ Inventory schema constraints working.");
                    return [4 /*yield*/, (0, inventory_repository_1.checkAvailableStock)(inventory.sanityProductId, 2)];
                case 4:
                    hasStock = _a.sent();
                    if (!hasStock) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, inventory_repository_1.incrementReservedStock)(inventory.sanityProductId, 2)];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [4 /*yield*/, db_1.prisma.inventory.findUnique({ where: { sanityProductId: inventory.sanityProductId } })];
                case 7:
                    updatedInventory = _a.sent();
                    if ((updatedInventory === null || updatedInventory === void 0 ? void 0 : updatedInventory.reservedStock) === 2) {
                        console.log("✅ In-memory/Soft Stock validation + Atomic Reservation successful.");
                    }
                    // Clean up
                    return [4 /*yield*/, db_1.prisma.inventory.delete({ where: { sanityProductId: inventory.sanityProductId } })];
                case 8:
                    // Clean up
                    _a.sent();
                    console.log("✅ All validations completed.");
                    return [3 /*break*/, 12];
                case 9:
                    error_1 = _a.sent();
                    console.error("❌ Validation Failed:", error_1);
                    return [3 /*break*/, 12];
                case 10: return [4 /*yield*/, db_1.prisma.$disconnect()];
                case 11:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 12: return [2 /*return*/];
            }
        });
    });
}
// To run: npx ts-node src/tests/db-validation.ts
if (require.main === module) {
    validateDatabase();
}
var templateObject_1;
