import express from "express";
const router = express.Router();

import { checkAuth } from "../../common/middlewares/auth.middleware.js";
import { EnderecoController } from "./endereco.controller.js";

router.get("/", checkAuth, EnderecoController.BuscarEnderecos);
router.get("/principal", checkAuth, EnderecoController.BuscarEnderecoPrincipal);
router.get("/:id", checkAuth, EnderecoController.BuscarEnderecoById);
router.post("/", checkAuth, EnderecoController.CriarEndereco);
router.put("/:id", checkAuth, EnderecoController.AtualizarEnderecoById);
router.delete("/:id/ativo", checkAuth, EnderecoController.ExcluirEndereco);
router.patch(
  "/:id/principal",
  checkAuth,
  EnderecoController.DefinirEnderecoPrincipal,
);

export default router;
