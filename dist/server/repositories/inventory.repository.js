"use strict";
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
exports.checkAvailableStock = checkAvailableStock;
exports.incrementReservedStock = incrementReservedStock;
exports.fulfillReservedStock = fulfillReservedStock;
exports.releaseReservedStock = releaseReservedStock;
var db_1 = require("@/lib/db");
var client_1 = require("@prisma/client");
/**
 * Checks if available stock is sufficient without modifying it.
 */
function checkAvailableStock(sanityProductId, requiredQuantity) {
    return __awaiter(this, void 0, void 0, function () {
        var inventory;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.prisma.inventory.findUnique({
                        where: { sanityProductId: sanityProductId },
                        select: { availableStock: true, reservedStock: true }
                    })];
                case 1:
                    inventory = _a.sent();
                    if (!inventory)
                        return [2 /*return*/, false];
                    return [2 /*return*/, inventory.availableStock >= requiredQuantity];
            }
        });
    });
}
/**
 * Atomically increments reservedStock. Called at PENDING order creation.
 */
function incrementReservedStock(sanityProductId, quantity) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, db_1.prisma.inventory.update({
                    where: { sanityProductId: sanityProductId },
                    data: {
                        reservedStock: {
                            increment: quantity,
                        },
                    },
                })];
        });
    });
}
/**
 * Atomically deducts availableStock, deducts reservedStock, and logs the transaction.
 * Called at CAPTURED webhook (Fulfillment).
 * Implements S5 Safety Rule: availableStock >= quantity guard is implicitly handled
 * if we use a raw query or Prisma where clause, but Prisma's update where doesn't
 * natively support conditional updates on fields easily without a transaction.
 */
function fulfillReservedStock(sanityProductId, quantity, orderId) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, db_1.prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                    var inventory, updated;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, tx.inventory.findUnique({
                                    where: { sanityProductId: sanityProductId },
                                })];
                            case 1:
                                inventory = _a.sent();
                                if (!inventory || inventory.availableStock < quantity) {
                                    throw new Error("Insufficient available stock for product ".concat(sanityProductId));
                                }
                                return [4 /*yield*/, tx.inventory.update({
                                        where: { sanityProductId: sanityProductId },
                                        data: {
                                            availableStock: { decrement: quantity },
                                            reservedStock: { decrement: quantity },
                                        },
                                    })];
                            case 2:
                                updated = _a.sent();
                                // 3. Log transaction
                                return [4 /*yield*/, tx.inventoryTransaction.create({
                                        data: {
                                            inventoryId: inventory.id,
                                            quantityChange: -quantity,
                                            reason: client_1.$Enums.TxnReason.ORDER_FULFILLMENT,
                                            orderId: orderId,
                                        },
                                    })];
                            case 3:
                                // 3. Log transaction
                                _a.sent();
                                return [2 /*return*/, updated];
                        }
                    });
                }); })];
        });
    });
}
/**
 * Releases reservedStock back. Called on payment failure / timeout.
 */
function releaseReservedStock(sanityProductId, quantity, orderId) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, db_1.prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                    var inventory;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, tx.inventory.update({
                                    where: { sanityProductId: sanityProductId },
                                    data: {
                                        reservedStock: { decrement: quantity },
                                    },
                                })];
                            case 1:
                                inventory = _a.sent();
                                return [4 /*yield*/, tx.inventoryTransaction.create({
                                        data: {
                                            inventoryId: inventory.id,
                                            quantityChange: 0, // reserved stock change doesn't technically change available physical stock, but we can log the event
                                            reason: client_1.$Enums.TxnReason.RESERVATION_RELEASE,
                                            orderId: orderId || null,
                                        },
                                    })];
                            case 2:
                                _a.sent();
                                return [2 /*return*/, inventory];
                        }
                    });
                }); })];
        });
    });
}
