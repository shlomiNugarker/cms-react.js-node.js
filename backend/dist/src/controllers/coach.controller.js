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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCoach = exports.deleteCoach = exports.addCoach = exports.getCoaches = void 0;
const user_service_1 = require("../services/user.service");
const getCoaches = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const coaches = yield (0, user_service_1.findAllUsers)();
        res.json(coaches.filter((user) => user.role === "coach"));
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch coaches" });
    }
});
exports.getCoaches = getCoaches;
const addCoach = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        const existingCoach = yield (0, user_service_1.checkIfUserExists)(email);
        if (existingCoach) {
            return res.status(400).json({ error: "Coach already exists" });
        }
        const newCoach = yield (0, user_service_1.createUser)(name, email, password, "coach");
        res
            .status(201)
            .json({ _id: newCoach._id, name: newCoach.name, email: newCoach.email });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to add coach" });
    }
});
exports.addCoach = addCoach;
const deleteCoach = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { coachId } = req.params;
        const coach = yield (0, user_service_1.findUserById)(coachId);
        if (!coach || coach.role !== "coach") {
            return res.status(404).json({ error: "Coach not found" });
        }
        yield (0, user_service_1.deleteUserById)(coachId);
        res.json({ message: "Coach deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete coach" });
    }
});
exports.deleteCoach = deleteCoach;
const updateCoach = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { coachId } = req.params;
        const data = req.body;
        const coach = yield (0, user_service_1.findUserById)(coachId);
        if (!coach || coach.role !== "coach") {
            return res.status(404).json({ error: "Coach not found" });
        }
        const updatedCoach = yield (0, user_service_1.updateUserById)(coachId, data);
        res.json(updatedCoach);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update coach" });
    }
});
exports.updateCoach = updateCoach;
