"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { getOrderHoursStatus, ORDER_HOURS_LABEL } from "@/lib/order-hours";

type Producto = {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  unidad: string;
  descripcion: string;
  imagen: string;
  emoji: string;
};

type DatosCliente = {
  nombre: string;
  telefono: string;
  direccion: string;
  referencia: string;
  comentarios: string;
};

const WHATSAPP = "524613499246"; // CAMBIA ESTE NÚMERO por tu WhatsApp con clave de país.

const productos: Producto[] = [
  {
    "id": "RHAMSIR1",
    "nombre": "HAMBURGUESAS DE SIRLOIN",
    "categoria": "Res",
    "precio": 80,
    "unidad": "paquete",
    "descripcion": "PAQUETE DE 4 HAMBURGUESAS DE SIRLOIN DE 80 GRAMOS CADA UNA",
    "imagen": "/productos/hamburguesas-sirloin.jpeg",
    "emoji": "🥩"
  },
  {
    "id": "CCHOESP1",
    "nombre": "CHORIZO ESPAÑOL",
    "categoria": "Cerdo",
    "precio": 120,
    "unidad": "kg",
    "descripcion": "CHORIZO ESPAÑOL DE CERDO, IDEAL PARA ASAR O PREPARAR EN GUISADOS",
    "imagen": "/productos/chorizo-espanol.jpeg",
    "emoji": "🐖"
  },
  {
    "id": "PCB1",
    "nombre": "BISTEC DE CERDO",
    "categoria": "Cerdo",
    "precio": 120,
    "unidad": "kg",
    "descripcion": "PIERNA DE CERDO BISTECEADA Y APLANADA PARA MILANESA O FREIR",
    "imagen": "https://drive.google.com/thumbnail?id=1VprAGs8FfpuAYTrhIGlwbsXRyP64ouVy&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "PCF2",
    "nombre": "PIERNA DE CERDO PA FREIR",
    "categoria": "Cerdo",
    "precio": 120,
    "unidad": "kg",
    "descripcion": "PIERNA DE CERDO EN TROCITOS PARA FREIR",
    "imagen": "https://drive.google.com/thumbnail?id=1-ytRF_EKgllmB_Bysye_UC07TQOBZND6&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "PCAR3",
    "nombre": "ARRACHERA MARINADA",
    "categoria": "Cerdo",
    "precio": 120,
    "unidad": "kg",
    "descripcion": "PIERNA DE CERDO BISTECEADA EN CORTE DELGADO Y MARINADA PARA ARRACHERA PARA ASAR",
    "imagen": "https://drive.google.com/thumbnail?id=1bJrld-Q8bop79UkZaLYThqC47N8KkSZ5&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "PCPAS4",
    "nombre": "BISTEC DE CERDO AL PASTOR",
    "categoria": "Cerdo",
    "precio": 120,
    "unidad": "kg",
    "descripcion": "PIERNA DE CERDO BISTECEADA EN CORTE DELGADO Y MARINADA AL PASTOR",
    "imagen": "https://drive.google.com/thumbnail?id=1VZmZ7LLZVGP4JQguc-rWTFu7spQWbhPE&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "PCMO5",
    "nombre": "MOLIDA",
    "categoria": "Cerdo",
    "precio": 120,
    "unidad": "kg",
    "descripcion": "PIERNA DE CERDO MOLIDA EN TAMAÑO DELGADO PARA HACER ALBONDIGAS",
    "imagen": "https://drive.google.com/thumbnail?id=1ULFvmwji33lMrHQBLMgIEGxFIXoN4Xi-&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "PCMOPAS6",
    "nombre": "MOLIDA AL PASTOR",
    "categoria": "Cerdo",
    "precio": 80,
    "unidad": "kg",
    "descripcion": "PIERNA DE CERDO MOLIDA EN CORTE GRUESO Y MARINADA AL PASTOR",
    "imagen": "https://drive.google.com/thumbnail?id=1BC9_c4DacRdfH-06l5UCZX69-5JNZiRN&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "CMA1",
    "nombre": "MANITAS",
    "categoria": "Cerdo",
    "precio": 60,
    "unidad": "kg",
    "descripcion": "MANITAS DE CERDO (ESPECIFICAR SU CORTE EN 2 O 4 PZAS)",
    "imagen": "https://drive.google.com/thumbnail?id=13l0jK9gzKIArPmemz6E8Be5hFWUzS1y2&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "CCHD1",
    "nombre": "CHICHARRON",
    "categoria": "Cerdo",
    "precio": 200,
    "unidad": "kg",
    "descripcion": "CHICHARRON DE CERDO DELGADO O RAYADO",
    "imagen": "https://drive.google.com/thumbnail?id=1dGZLuA5vQ9VgK9mfR_49YlZkHYg0jR2c&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "CCHC2",
    "nombre": "CHICHARRON CON CARNE",
    "categoria": "Cerdo",
    "precio": 300,
    "unidad": "kg",
    "descripcion": "CHICHARRON DE CERDO CON CARNE",
    "imagen": "https://drive.google.com/thumbnail?id=1dGZLuA5vQ9VgK9mfR_49YlZkHYg0jR2c&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "CCHAH1",
    "nombre": "CHULETA AHUMADA",
    "categoria": "Cerdo",
    "precio": 110,
    "unidad": "kg",
    "descripcion": "CHULETA AHUMADA DE CERDO",
    "imagen": "https://drive.google.com/thumbnail?id=1kQsbeTE_vktWlHNN4oo4vMYa0PbFVEaU&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "CCHN1",
    "nombre": "CHULETA DE CERDO NATURAL",
    "categoria": "Cerdo",
    "precio": 120,
    "unidad": "kg",
    "descripcion": "CHULETA DE CERDO NATURAL REBANADA Y APLANADA",
    "imagen": "https://drive.google.com/thumbnail?id=1vfs2S0uHGuWJbVDi4hC6Gh_e-R-McCnI&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "CMIG1",
    "nombre": "MIGAJAS PA GORDITAS",
    "categoria": "Cerdo",
    "precio": 120,
    "unidad": "kg",
    "descripcion": "MIGAJAS PA GORDITAS",
    "imagen": "https://drive.google.com/thumbnail?id=1wvwgjCJBgA4z4uS0px6O3Bl-dMiCnCVH&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "CCAR1",
    "nombre": "CARRILLERA",
    "categoria": "Cerdo",
    "precio": 180,
    "unidad": "kg",
    "descripcion": "CARRILLERA DE CERDO PARA BARBECUE",
    "imagen": "https://drive.google.com/thumbnail?id=1OllKWpy0VKl38FPeT4HvQGhU9LCtUn7a&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "CCARN1",
    "nombre": "CARNITAS",
    "categoria": "Cerdo",
    "precio": 300,
    "unidad": "kg",
    "descripcion": "CARNITAS DE CERDO SURTIDAS(MACISA, CUERO, COSTILLA)",
    "imagen": "https://drive.google.com/thumbnail?id=1AJmCxM16IQLObIsc8DL_OhuBxiXqz41G&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "CBU1",
    "nombre": "BUCHE",
    "categoria": "Cerdo",
    "precio": 90,
    "unidad": "kg",
    "descripcion": "BUCHE DE CERDO CONGELADO",
    "imagen": "https://drive.google.com/thumbnail?id=1lQTnhWd-G8iMnkePdUPLBImvDsRbwgal&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "CCHOG1",
    "nombre": "CHORIZO A GRANEL",
    "categoria": "Cerdo",
    "precio": 90,
    "unidad": "kg",
    "descripcion": "CHORIZO DE CERDO 80/20 A GRANEL PARA FREIR",
    "imagen": "https://drive.google.com/thumbnail?id=1wiinPTMGrKfmCpwRm91gdPLyHpCQ_TAd&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "CMANB1",
    "nombre": "MANTECA BLANCA",
    "categoria": "Cerdo",
    "precio": 60,
    "unidad": "kg",
    "descripcion": "MANTECA BLANCA DE CERDO",
    "imagen": "https://drive.google.com/thumbnail?id=1NQR2vEa1RjC7yycGAOItYmtsbk3q-mO0&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "CTOCN1",
    "nombre": "TOCINETA",
    "categoria": "Cerdo",
    "precio": 180,
    "unidad": "kg",
    "descripcion": "TOCINETA DE CERDO NATURAL REBANADA(CONGELADA PARA SU MEJOR CORTE)",
    "imagen": "https://drive.google.com/thumbnail?id=1jxwbCoUX3IcWpjrF0VkXD9E9wX-bWx58&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "CTOCMA2",
    "nombre": "TOCINETA MARINADA",
    "categoria": "Cerdo",
    "precio": 180,
    "unidad": "kg",
    "descripcion": "TOCINETA MARINADA PARA ASAR(PUEDE SER CONGELADA)",
    "imagen": "https://drive.google.com/thumbnail?id=1jxwbCoUX3IcWpjrF0VkXD9E9wX-bWx58&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "CTOCADO3",
    "nombre": "TOCINETA ADOBADA",
    "categoria": "Cerdo",
    "precio": 180,
    "unidad": "kg",
    "descripcion": "TOCINETA DE CERDO ADOBADA(PUEDE SER CONGELADA)",
    "imagen": "https://drive.google.com/thumbnail?id=1jxwbCoUX3IcWpjrF0VkXD9E9wX-bWx58&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "CHUEPZ1",
    "nombre": "HUESO PA POZOLE",
    "categoria": "Cerdo",
    "precio": 20,
    "unidad": "kg",
    "descripcion": "HUESO DE CERDO PA POZOLE(PUEDE SER CONGELADO SEGÚN EXISTENCIAS)",
    "imagen": "https://drive.google.com/thumbnail?id=1aqxYYW6HR1L9OzaBirBcjnuK20_FhoFG&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "CCHIS1",
    "nombre": "CHISTORRA",
    "categoria": "cerdo",
    "precio": 150,
    "unidad": "kg",
    "descripcion": "CHISTORRA DE CERDO Y RES EMPACADA AL VACIO",
    "imagen": "https://drive.google.com/thumbnail?id=17bEzZyqkjmtQiJGovfdqIM2z1e5QpbDO&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "CCAB1",
    "nombre": "CABEZA",
    "categoria": "cerdo",
    "precio": 30,
    "unidad": "kg",
    "descripcion": "CABEZA DE CERDO(PUEDE SER FRESCA O CONGELADA SEGÚN EXISTENCIAS, SE PUEDE PARTIR EN 2 O EN 4 PARTES, SE VENDE MINIMO UNA MITAD)",
    "imagen": "https://drive.google.com/thumbnail?id=1R5DhQHVuJ-FGDGHsDP1Cjp3i_tGKMN31&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "CCHAM1",
    "nombre": "CHAMORRO",
    "categoria": "cerdo",
    "precio": 70,
    "unidad": "kg",
    "descripcion": "CHAMORRO DE CERDO( SE PUEDE VENDER ENTERO O TROZEADO)PUEDE SER FRESCO O CONGELADO SEGÚN EXISTENCIAS",
    "imagen": "https://drive.google.com/thumbnail?id=1-KRjELrA0R938Me5XZTLPGn4yZbyRfc2&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "CR8020FR1",
    "nombre": "CARNE PA FREIR 80/20",
    "categoria": "Cerdo",
    "precio": 100,
    "unidad": "kg",
    "descripcion": "CARNE DE CERDO PA FREIR DE RECORTE 80/20",
    "imagen": "https://drive.google.com/thumbnail?id=1-ytRF_EKgllmB_Bysye_UC07TQOBZND6&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "CCHOAS2",
    "nombre": "CHORIZO PA ASAR AMARRADO",
    "categoria": "Cerdo",
    "precio": 120,
    "unidad": "kg",
    "descripcion": "CHORIZO DE CERDO 80/20 PA ASAR",
    "imagen": "https://drive.google.com/thumbnail?id=1nHqdrl4vwjoxU9UWZvV7Nk9uLs-Dtvvi&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "CCHOARG3",
    "nombre": "CHORIZO ARGENTINO",
    "categoria": "Cerdo",
    "precio": 150,
    "unidad": "kg",
    "descripcion": "CHORIZO ARGENTINO",
    "imagen": "https://drive.google.com/thumbnail?id=15-icj3AyeWOHTWE0R2_BwsYD4quZSCHu&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "CCHOLON4",
    "nombre": "LONGANIZA",
    "categoria": "Cerdo",
    "precio": 120,
    "unidad": "kg",
    "descripcion": "LONGANIZA DE CERDO Y RES 80/20",
    "imagen": "https://drive.google.com/thumbnail?id=1XpeZp9_talU5aEcMG27B3JTwCtzcTgPp&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "CR8020MOLPT2",
    "nombre": "MOLIDA PARA TACOS",
    "categoria": "Cerdo",
    "precio": 85,
    "unidad": "kg",
    "descripcion": "RECORTE 80/20 MOLIDO PARA TACOS CORTE GRUESO",
    "imagen": "https://drive.google.com/thumbnail?id=1wF_Hvj7G6OhF4F1yx2nblnxzWPuJb6u2&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "CLOM1",
    "nombre": "LOMO",
    "categoria": "Cerdo",
    "precio": 140,
    "unidad": "kg",
    "descripcion": "LOMO DE CERDO( SE PUEDE VENDER POR CAÑA ENTERA O BISTECEADO Y APLANADO PARA MILANEZAS)",
    "imagen": "https://drive.google.com/thumbnail?id=1vfs2S0uHGuWJbVDi4hC6Gh_e-R-McCnI&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "CPF1",
    "nombre": "PUNTAS DE FILETE",
    "categoria": "Cerdo",
    "precio": 180,
    "unidad": "kg",
    "descripcion": "PUNTAS DE FILETE(SE PUEDE VENDER LA PIEZA ENTERA O BISTECEADO Y APLANADO PARA BISTECES)",
    "imagen": "https://drive.google.com/thumbnail?id=1EXd2ymcJQMzhZWyyW6PdpKDoRkCIgD5a&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "MAR1",
    "nombre": "MAIZ ROJO",
    "categoria": "Cerdo",
    "precio": 55,
    "unidad": "kg",
    "descripcion": "MAIZ ROJO EMPACADO AL VACIO PA POZOLE",
    "imagen": "https://drive.google.com/thumbnail?id=1GUfAa2muQBm1BLR2UIv33ymvoqIQCZmz&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "MAB2",
    "nombre": "MAIZ BLANCO",
    "categoria": "Varios",
    "precio": 35,
    "unidad": "kg",
    "descripcion": "MAIZ BLANCO PARA POZLE EMPACADO AL VACIO",
    "imagen": "https://drive.google.com/thumbnail?id=1U25aF4nh-W2BxwLEoYm37HshtO3VWKFY&sz=w1200",
    "emoji": "🛒"
  },
  {
    "id": "CCHUES1",
    "nombre": "CHULETA ESTRELLA",
    "categoria": "Cerdo",
    "precio": 150,
    "unidad": "kg",
    "descripcion": "CHULETA ESTRELLA PA ASAR( SE VENDE CONGELADA PARA SU MEJOR CORTE)",
    "imagen": "https://drive.google.com/thumbnail?id=1KFqL_FK7_JE28cbfS_-QBXvvqdSCiT0v&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "CCHOVDE5",
    "nombre": "CHORIZO VERDE",
    "categoria": "Cerdo",
    "precio": 150,
    "unidad": "kg",
    "descripcion": "CHORIZO VERDE PA ASAR 80/20",
    "imagen": "https://drive.google.com/thumbnail?id=1yh3ElyBtoY15AUhJaotSW8IpLkpgEpWT&sz=w1200",
    "emoji": "🐖"
  },
  {
    "id": "RBA1",
    "nombre": "RES PARA BARBACOA",
    "categoria": "Res",
    "precio": 240,
    "unidad": "kg",
    "descripcion": "CARNE DE RES PARA HACER BARBACOA(COSTILLA, DIEZMILLO Y MACIZA)",
    "imagen": "https://drive.google.com/thumbnail?id=1J_FukjipovzqdGisoyBtyAy_0TIVoZDZ&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "RSE1",
    "nombre": "SESOS",
    "categoria": "Res",
    "precio": 140,
    "unidad": "kg",
    "descripcion": "SESOS DE RES CONGELADOS",
    "imagen": "https://drive.google.com/thumbnail?id=1AkZytYJAs6QA2MMgS-kbNOWsLN3RaADj&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "RMEPR1",
    "nombre": "MENUDO PRECOCIDO",
    "categoria": "Res",
    "precio": 90,
    "unidad": "kg",
    "descripcion": "MENUDO FRESCO PRECOCIDO(PANZA, CAYO, PANAL Y LIBRO)",
    "imagen": "https://drive.google.com/thumbnail?id=1oXTAYLmoH94AKYAlrzuMDkXSrmzSkXQz&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "RTRI1",
    "nombre": "TRIPAS",
    "categoria": "Res",
    "precio": 100,
    "unidad": "kg",
    "descripcion": "TRIPAS DE RES PA PACHARELAS(POR LO GENERAL VIENE FRESCO A ALGUNAS ESCEPCIONES)",
    "imagen": "https://drive.google.com/thumbnail?id=1bw51sTu7b9wT--ExkOM7dQiQ7nHPaX-b&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "RBIFA1",
    "nombre": "FAJITAS DE RES",
    "categoria": "Res",
    "precio": 300,
    "unidad": "kg",
    "descripcion": "BISTECES DE RES FILETEADOS EN LAMINAS",
    "imagen": "https://drive.google.com/thumbnail?id=1bJrld-Q8bop79UkZaLYThqC47N8KkSZ5&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "RCHMCH1",
    "nombre": "CHAMBARETE CON HUESO PA COCIDO",
    "categoria": "Res",
    "precio": 230,
    "unidad": "kg",
    "descripcion": "CHAMBARETE CON HUESO PA COCIDO",
    "imagen": "https://drive.google.com/thumbnail?id=1E5rEDqH9Qd96h_nXBnhQeqOvZmP8uZ7N&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "RCHMSH2",
    "nombre": "CHAMBARETE SIN HUESO PA COCIDO",
    "categoria": "Res",
    "precio": 240,
    "unidad": "kg",
    "descripcion": "CHAMBARETE SIN HUESO PA COCIDO",
    "imagen": "https://drive.google.com/thumbnail?id=1kHEtMp0athg-HaAzoOZbOSpa68xSDr4Q&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "RPA1",
    "nombre": "PATA DE RES PRECOCIDA",
    "categoria": "Res",
    "precio": 80,
    "unidad": "kg",
    "descripcion": "PATA DE RES PRECOCIDA REBANADA",
    "imagen": "https://drive.google.com/thumbnail?id=1pKO9QAxpuYyJ9V1q-SMhpTe3cU8eGXuP&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "RTUE1",
    "nombre": "HUESO DE TUETANO",
    "categoria": "Res",
    "precio": 80,
    "unidad": "kg",
    "descripcion": "HUESO DE TUETANOS REBANADOS A LO LARGO O EN RUEDAS",
    "imagen": "https://drive.google.com/thumbnail?id=17_uZJda1GzG8kspl8Cm-D4-C9Lw_KgSY&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "RFAL1",
    "nombre": "FALDA PA DESEBRAR",
    "categoria": "Res",
    "precio": 300,
    "unidad": "kg",
    "descripcion": "FALDA DE RES PARA DESEBRAR",
    "imagen": "https://drive.google.com/thumbnail?id=1kWW9dWtVvwiGlOOKUrG937L1KpHtlXe2&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "RCAB1",
    "nombre": "CABEZA DE RES",
    "categoria": "Res",
    "precio": 80,
    "unidad": "kg",
    "descripcion": "CABEZA DE RES (SE VENDE POR MITAN MINIMO)INCLUYE LENGUA Y SESOS",
    "imagen": "https://drive.google.com/thumbnail?id=1DlUfyHA_UyQMrkZGtRujqk0noYTXGViP&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "RARM2",
    "nombre": "ARRACHERA MARINADA DE RES",
    "categoria": "Res",
    "precio": 280,
    "unidad": "kg",
    "descripcion": "ARRACHERA MARINADA DE RES PA ASAR",
    "imagen": "https://drive.google.com/thumbnail?id=1b6sAxP19pbWGxTtE16PVGbx3T_BFVAxJ&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "RCHU1",
    "nombre": "CHULETA DE RES",
    "categoria": "Res",
    "precio": 300,
    "unidad": "kg",
    "descripcion": "CHULETA DE RES PA ASAR (PUEDE VENIR CONGELADA PARA MEJOR CORTE)",
    "imagen": "https://drive.google.com/thumbnail?id=1LcY60CFJqgwXGMdGc_8KrhxcdK7JUQg4&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "RCOC1",
    "nombre": "CARNE PA COCIDO",
    "categoria": "Res",
    "precio": 240,
    "unidad": "kg",
    "descripcion": "CARNE DE RES PA COCIDO (CHAMBARETE, COSTILLA Y MACISA)",
    "imagen": "https://drive.google.com/thumbnail?id=1wQn54yro0UjKzL9o6Pz-i0H9jSLxthg5&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "RSUA1",
    "nombre": "SUADERO",
    "categoria": "Res",
    "precio": 240,
    "unidad": "kg",
    "descripcion": "SUDAERO DE RES",
    "imagen": "https://drive.google.com/thumbnail?id=1zRql8cOUp2UqZYXgL0pTE3obHvX-yZXY&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "RMED1",
    "nombre": "MEDULA",
    "categoria": "Res",
    "precio": 120,
    "unidad": "kg",
    "descripcion": "MEDULA DE RES CONGELADA",
    "imagen": "https://drive.google.com/thumbnail?id=1aPT9_qTJ00O8Ry0dXws_GxYgHYjqEnau&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "RPIC1",
    "nombre": "PICAÑA",
    "categoria": "Res",
    "precio": 320,
    "unidad": "kg",
    "descripcion": "PICAÑA DE RES (CORTE DE 200GR)",
    "imagen": "https://drive.google.com/thumbnail?id=1dtdd8hHSP4WQiy3noOUU3i4gaZg0wPZ-&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "RAGN1",
    "nombre": "AGUJA NORTEÑA",
    "categoria": "Res",
    "precio": 240,
    "unidad": "kg",
    "descripcion": "CORTE DE RES AGUJA NORTEÑA PA ASAR",
    "imagen": "https://drive.google.com/thumbnail?id=1HJFkVavQIzCRRfyWwEK5d2MPHJMuJvHF&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "RVIR1",
    "nombre": "VIRIL PA COCTAIL",
    "categoria": "Res",
    "precio": 140,
    "unidad": "kg",
    "descripcion": "BOLSA DE VIRIL EN VINAGRE PA HACER COCTAIL",
    "imagen": "https://drive.google.com/thumbnail?id=1VibjR9kEVfB6hgjCnTTp0GDEBmvVbMk0&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "RLENG1",
    "nombre": "LENGUA",
    "categoria": "Res",
    "precio": 350,
    "unidad": "kg",
    "descripcion": "LENGUA DE RES PZA CONGELADA",
    "imagen": "https://drive.google.com/thumbnail?id=1j-_vJWIGrQO1NFB_o5HvXYR5LXjbgcvR&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "RRIB1",
    "nombre": "RIB EYE",
    "categoria": "Res",
    "precio": 360,
    "unidad": "kg",
    "descripcion": "CORTE DE RES PA ASAR RIB EYE",
    "imagen": "https://drive.google.com/thumbnail?id=1UiZcDZWrxEnYylwKi2XjoTB7C9yQ9To5&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "RNEW1",
    "nombre": "NEW YORK",
    "categoria": "Res",
    "precio": 360,
    "unidad": "kg",
    "descripcion": "CORTE DE RES PA ASAR NEW YORK",
    "imagen": "https://drive.google.com/thumbnail?id=17MdoKtK9G5mcPE91jYnYFPGOnVOJMMor&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "RBIS1",
    "nombre": "BISTEC DE RES",
    "categoria": "Res",
    "precio": 300,
    "unidad": "kg",
    "descripcion": "PULPA DE RES BISTECEADA Y APLANADA FRESCO",
    "imagen": "https://drive.google.com/thumbnail?id=1aXcsqnQXLYIpqkk7a_2uUgCDRwbLxIl3&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "RMOL1",
    "nombre": "MOLIDA DE RES",
    "categoria": "Res",
    "precio": 260,
    "unidad": "kg",
    "descripcion": "CARNE MAGRA DE RES 90/10 MOLIDA, CORTE DELGADO",
    "imagen": "https://drive.google.com/thumbnail?id=1p2w4zdI6UxaE8dQ3i7A2CNUaZ0T-fNQU&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "RHIG1",
    "nombre": "HIGADO DE RES",
    "categoria": "Res",
    "precio": 90,
    "unidad": "kg",
    "descripcion": "HIGADO DE RES FRESCO LAMINADO",
    "imagen": "https://drive.google.com/thumbnail?id=1VlIMq0G6Az0tVuQThU3SJpbrNFJr6L0K&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "RCECADB1",
    "nombre": "CECINA DE RES ADOBADA FRESCA",
    "categoria": "Res",
    "precio": 300,
    "unidad": "kg",
    "descripcion": "PULPA DE RES BISTECEADA EN LAMINA ADOBADA, LIMON Y SAL",
    "imagen": "https://drive.google.com/thumbnail?id=1JGQrL0AW9BGWJ4BqANlIP4oXuiNWpoaO&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "RCEFRS1",
    "nombre": "CECINA DE RES FRESCA",
    "categoria": "Res",
    "precio": 300,
    "unidad": "kg",
    "descripcion": "PULPA DE RES BISTECEADA EN LAMINA FRESCA CON SAL Y LIMON",
    "imagen": "https://drive.google.com/thumbnail?id=1yi28pkUToOozWv36xuPM4Niw6qhY7Ja3&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "RCMOLD1",
    "nombre": "MOLIDA MIXTA",
    "categoria": "Res",
    "precio": 180,
    "unidad": "kg",
    "descripcion": "CARNE DE RES Y CERDO 50/50 MOLIDA",
    "imagen": "https://drive.google.com/thumbnail?id=1egMH5yka6EEJ9ZvDFtSHddFcKLwcizYh&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "RPESMOL2",
    "nombre": "MOLIDA PA JUGO",
    "categoria": "Res",
    "precio": 260,
    "unidad": "kg",
    "descripcion": "CARNE DE PESCUEZO MOLIDA PARA HACER EN SU JUGO(TARTARA)",
    "imagen": "https://drive.google.com/thumbnail?id=1p2w4zdI6UxaE8dQ3i7A2CNUaZ0T-fNQU&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "RCESEC3",
    "nombre": "CECINA DE RES SECA",
    "categoria": "Res",
    "precio": 1000,
    "unidad": "kg",
    "descripcion": "PULPA DE RES BISTECEADA Y APLANADA SECA CON SAL Y LIMON",
    "imagen": "https://drive.google.com/thumbnail?id=18kOyic7WfFNBDX5BMbn_MeaDRiWANrDw&sz=w1200",
    "emoji": "🥩"
  },
  {
    "id": "POPECSH1",
    "nombre": "PECHUGA SIN HUESO",
    "categoria": "Pollo",
    "precio": 200,
    "unidad": "kg",
    "descripcion": "PECHUGA SIN HUESO FRESCA",
    "imagen": "https://drive.google.com/thumbnail?id=17Yr5gcnp1ahe8MVqzjQhIYJZkFqOetr_&sz=w1200",
    "emoji": "🍗"
  },
  {
    "id": "POPECSHMO2",
    "nombre": "PECHUGA SIN HUESO MOLIDA",
    "categoria": "Pollo",
    "precio": 200,
    "unidad": "kg",
    "descripcion": "PECHUGA DE POLLO FRESCA MOLIDA",
    "imagen": "https://drive.google.com/thumbnail?id=17Yr5gcnp1ahe8MVqzjQhIYJZkFqOetr_&sz=w1200",
    "emoji": "🍗"
  },
  {
    "id": "PO1",
    "nombre": "POLLO",
    "categoria": "Pollo",
    "precio": 100,
    "unidad": "kg",
    "descripcion": "POLLO ENTERO SIN CABEZAS NI MENUDENCIAS PARTIDO(FRESCO)",
    "imagen": "https://drive.google.com/thumbnail?id=1pCo5ZGZ8nmXPIXTnwcTgPiDQaptryV_N&sz=w1200",
    "emoji": "🍗"
  },
  {
    "id": "POPYM2",
    "nombre": "PIERNA Y MUSLO",
    "categoria": "Pollo",
    "precio": 80,
    "unidad": "kg",
    "descripcion": "PIERNA Y MUSLO DE POLLO FRESCO",
    "imagen": "https://drive.google.com/thumbnail?id=100JXixRQPBP_jQIXPV4gfJlucZnWg2TI&sz=w1200",
    "emoji": "🍗"
  },
  {
    "id": "POHUE1",
    "nombre": "HUEVO FRESCO",
    "categoria": "Pollo",
    "precio": 65,
    "unidad": "kg",
    "descripcion": "CAJA DE HUEVO FRESCO 12 PZAS",
    "imagen": "https://drive.google.com/thumbnail?id=1cwS4ldR3rqNvTz3UolsbYMY8iTyJqoki&sz=w1200",
    "emoji": "🍗"
  },
  {
    "id": "POALHT1",
    "nombre": "ALITAS HOT WINGS",
    "categoria": "Pollo",
    "precio": 120,
    "unidad": "kg",
    "descripcion": "ALITAS DE POLLO PICOSITAS HOT WINGS FRESCAS",
    "imagen": "https://drive.google.com/thumbnail?id=1lzMHT0EzvhgZIs56PfyzzUyvUIsTaxnT&sz=w1200",
    "emoji": "🍗"
  },
  {
    "id": "POMIL3",
    "nombre": "MILANESA DE POLLO",
    "categoria": "Pollo",
    "precio": 220,
    "unidad": "kg",
    "descripcion": "PECHUGA FRESCA BISTECEADA Y APLANADA PA MILANEZAS",
    "imagen": "https://drive.google.com/thumbnail?id=1EJ9bAZ-oG10LUf5cisdZuuVaxA2sp8HH&sz=w1200",
    "emoji": "🍗"
  },
  {
    "id": "PESTIL1",
    "nombre": "FILTE TILAPIA",
    "categoria": "Pescado",
    "precio": 140,
    "unidad": "kg",
    "descripcion": "FILETE DE PESCADO TILAPIA CONGELADO 90/10",
    "imagen": "https://drive.google.com/thumbnail?id=1Nlp3-yH1ctTTkhqGSSXHEbZfOemCQCFS&sz=w1200",
    "emoji": "🐟"
  },
  {
    "id": "QASA1",
    "nombre": "QUESO ASADERO",
    "categoria": "Lácteos",
    "precio": 200,
    "unidad": "kg",
    "descripcion": "QUESO ASADERO FRESCO",
    "imagen": "https://drive.google.com/thumbnail?id=1bjOvR6UXFPPCDVWEbIRacO9_vc3JCaty&sz=w1200",
    "emoji": "🧀"
  },
  {
    "id": "QRAN1",
    "nombre": "QUESO RANCHERO",
    "categoria": "Lácteos",
    "precio": 200,
    "unidad": "kg",
    "descripcion": "QUESO FRESCO RANCHERO",
    "imagen": "https://drive.google.com/thumbnail?id=1ZKqtj_V4G5mZguZXWSyh4s_6lfhLOen0&sz=w1200",
    "emoji": "🧀"
  }
];

const promociones = [
  {
    productoId: "PCB1",
    titulo: "Bistec de cerdo",
    precioNormal: 160,
    precioPromocion: 120,
    unidad: "kg",
    descripcion: "Pierna de cerdo bisteceada y aplanada.",
    emoji: "🥩",
  },
  {
    productoId: "PCMOPAS6",
    titulo: "Molida al pastor",
    precioNormal: 140,
    precioPromocion: 80,
    unidad: "kg",
    descripcion: "Carne molida de cerdo marinada al pastor.",
    emoji: "🌮",
  },
  {
    productoId: "CCHOG1",
    titulo: "Chorizo a granel",
    precioNormal: 120,
    precioPromocion: 100,
    unidad: "kg",
    descripcion: "Chorizo de cerdo 80/20 listo para freír.",
    emoji: "🔥",
  },
  {
    productoId: "CR8020MOLPT2",
    titulo: "Molida para tacos",
    precioNormal: 120,
    precioPromocion: 85,
    unidad: "kg",
    descripcion: "Recorte 80/20 molido en corte grueso.",
    emoji: "🌮",
  },
];

const preciosPromocion: Record<string, number> = Object.fromEntries(
  promociones.map((promo) => [promo.productoId, promo.precioPromocion])
);

function precioVigente(producto: Producto) {
  return preciosPromocion[producto.id] ?? producto.precio;
}

export default function Home() {
  const [catalogProducts, setCatalogProducts] = useState<Producto[]>(productos);
  const [carrito, setCarrito] = useState<Record<string, number>>({});
  const [categoria, setCategoria] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [modoTV, setModoTV] = useState(false);
  const [indiceTV, setIndiceTV] = useState(0);
  const [pausadoTV, setPausadoTV] = useState(false);
  const [mostrarBienvenida, setMostrarBienvenida] = useState(false);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [confirmacionProducto, setConfirmacionProducto] = useState("");
  const [procesandoClip, setProcesandoClip] = useState(false);
  const [errorClip, setErrorClip] = useState("");
  const [procesandoWhatsApp, setProcesandoWhatsApp] = useState(false);
  const [errorWhatsApp, setErrorWhatsApp] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [whatsappPaymentMethod, setWhatsAppPaymentMethod] = useState<"TRANSFER" | "CASH_ON_DELIVERY">("TRANSFER");
  const [horarioPedidos, setHorarioPedidos] = useState(() => getOrderHoursStatus());
  const [datos, setDatos] = useState<DatosCliente>({
    nombre: "",
    telefono: "",
    direccion: "",
    referencia: "",
    comentarios: "",
  });

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return catalogProducts.filter((p) => {
      const porCategoria = categoria === "Todos" || p.categoria === categoria;
      const porTexto = !texto || `${p.nombre} ${p.descripcion}`.toLowerCase().includes(texto);
      return porCategoria && porTexto;
    });
  }, [catalogProducts, categoria, busqueda]);
  const catalogCategories = useMemo(() => ["Todos", ...new Set(catalogProducts.map((product) => product.categoria))], [catalogProducts]);

  useEffect(() => {
    let active = true;
    fetch("/api/products", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("CATALOG_FETCH_FAILED")))
      .then((nextProducts: Producto[]) => { if (active && nextProducts.length) setCatalogProducts(nextProducts); })
      .catch(() => { /* Conserva el catálogo incluido si la red no responde. */ });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (window.localStorage.getItem("lonja-promocion-bienvenida")) return;
    let mostrado = false;
    const mostrar = () => {
      if (mostrado) return;
      mostrado = true;
      setMostrarBienvenida(true);
      window.removeEventListener("scroll", alDesplazarse);
    };
    const alDesplazarse = () => {
      if (window.scrollY > Math.min(500, window.innerHeight * 0.4)) mostrar();
    };
    const temporizador = window.setTimeout(mostrar, 12_000);
    window.addEventListener("scroll", alDesplazarse, { passive: true });
    return () => {
      window.clearTimeout(temporizador);
      window.removeEventListener("scroll", alDesplazarse);
    };
  }, []);

  useEffect(() => {
    const actualizarHorario = () => setHorarioPedidos(getOrderHoursStatus());
    actualizarHorario();
    const temporizador = window.setInterval(actualizarHorario, 30000);
    return () => window.clearInterval(temporizador);
  }, []);

  useEffect(() => {
    if (!modoTV || pausadoTV) return;
    const temporizador = window.setInterval(() => {
      setIndiceTV((indice) => (indice + 1) % catalogProducts.length);
    }, 7000);
    return () => window.clearInterval(temporizador);
  }, [modoTV, pausadoTV, catalogProducts.length]);

  useEffect(() => {
    if (!confirmacionProducto) return;
    const temporizador = window.setTimeout(() => setConfirmacionProducto(""), 2400);
    return () => window.clearTimeout(temporizador);
  }, [confirmacionProducto]);

  useEffect(() => {
    if (!carritoAbierto) return;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setCarritoAbierto(false);
    };
    window.addEventListener("keydown", cerrarConEscape);
    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener("keydown", cerrarConEscape);
    };
  }, [carritoAbierto]);

  useEffect(() => {
    if (!modoTV) return;
    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setModoTV(false);
      if (evento.key === "ArrowRight") setIndiceTV((indice) => (indice + 1) % catalogProducts.length);
      if (evento.key === "ArrowLeft") setIndiceTV((indice) => (indice - 1 + catalogProducts.length) % catalogProducts.length);
      if (evento.key === " ") setPausadoTV((valor) => !valor);
    };
    window.addEventListener("keydown", cerrarConEscape);
    return () => window.removeEventListener("keydown", cerrarConEscape);
  }, [modoTV, catalogProducts.length]);

  const abrirModoTV = async () => {
    setIndiceTV(0);
    setPausadoTV(false);
    setModoTV(true);
    try {
      await document.documentElement.requestFullscreen?.();
    } catch {
      // El carrusel funciona aunque el navegador no permita pantalla completa.
    }
  };

  const cerrarModoTV = async () => {
    setModoTV(false);
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch {
      // No es necesario hacer nada si el navegador ya salió de pantalla completa.
    }
  };

  const cerrarBienvenida = () => {
    window.localStorage.setItem("lonja-promocion-bienvenida", "vista");
    setMostrarBienvenida(false);
  };

  const mensajeBienvenida = encodeURIComponent(
    "Hola, quiero registrarme para recibir envío gratis en mi primera compra de $300 o más."
  );

  const cambiarCantidad = (id: string, delta: number) => {
    if (delta > 0) {
      const producto = catalogProducts.find((item) => item.id === id);
      if (producto) setConfirmacionProducto(`${producto.nombre} agregado · Ver mi pedido`);
    }
    setCarrito((prev) => {
      const actual = prev[id] || 0;
      const nuevo = Math.max(0, Math.round((actual + delta) * 10) / 10);
      return { ...prev, [id]: nuevo };
    });
  };

  const items = Object.entries(carrito)
    .filter(([, cantidad]) => cantidad > 0)
    .map(([id, cantidad]) => {
      const producto = catalogProducts.find((p) => p.id === id)!;
      return {
        ...producto,
        precioOriginal: producto.precio,
        precio: precioVigente(producto),
        cantidad,
      };
    });

  const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const cantidadArticulos = items.reduce((sum, item) => sum + item.cantidad, 0);

  const continuarAlCheckout = () => {
    setCarritoAbierto(false);
    window.requestAnimationFrame(() => {
      document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const pedidoValido = Boolean(items.length > 0 && datos.nombre.trim() && datos.telefono.trim() && (deliveryMethod === "PICKUP" || datos.direccion.trim()));
  const pedidoHabilitado = pedidoValido && horarioPedidos.isOpen;

  const pagarConClip = async () => {
    const horarioActual = getOrderHoursStatus();
    setHorarioPedidos(horarioActual);
    if (!horarioActual.isOpen) {
      setErrorClip(horarioActual.message);
      return;
    }
    if (!pedidoValido || procesandoClip) return;

    setProcesandoClip(true);
    setErrorClip("");

    try {
      const respuesta = await fetch("/api/clip/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(total.toFixed(2)),
          deliveryMethod,
          customer: {
            name: datos.nombre.trim(),
            phone: datos.telefono.trim(),
          },
          delivery: {
            address: datos.direccion.trim(),
            reference: datos.referencia.trim(),
            comments: datos.comentarios.trim(),
          },
          items: items.map((item) => ({
            id: item.id,
            name: item.nombre,
            quantity: item.cantidad,
            unit: item.unidad,
            unitPrice: item.precio,
          })),
        }),
      });

      const resultado = await respuesta.json();
      if (!respuesta.ok || !resultado.paymentUrl) {
        throw new Error(resultado.error || "No fue posible iniciar el pago con Clip.");
      }

      window.location.assign(resultado.paymentUrl);
    } catch (error) {
      setErrorClip(error instanceof Error ? error.message : "No fue posible iniciar el pago con Clip.");
      setProcesandoClip(false);
    }
  };

  const enviarPorWhatsApp = async () => {
    const horarioActual = getOrderHoursStatus();
    setHorarioPedidos(horarioActual);
    if (!horarioActual.isOpen) {
      setErrorWhatsApp(horarioActual.message);
      return;
    }
    if (!pedidoValido || procesandoWhatsApp) return;

    const ventanaWhatsApp = window.open("", "_blank");
    setProcesandoWhatsApp(true);
    setErrorWhatsApp("");

    try {
      const respuesta = await fetch("/api/orders/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(total.toFixed(2)),
          deliveryMethod,
          paymentMethod: whatsappPaymentMethod,
          customer: { name: datos.nombre.trim(), phone: datos.telefono.trim() },
          delivery: {
            address: datos.direccion.trim(),
            reference: datos.referencia.trim(),
            comments: datos.comentarios.trim(),
          },
          items: items.map((item) => ({
            id: item.id,
            name: item.nombre,
            quantity: item.cantidad,
            unit: item.unidad,
            unitPrice: item.precio,
          })),
        }),
      });
      const resultado = await respuesta.json();
      if (!respuesta.ok || !resultado.whatsappUrl) {
        throw new Error(resultado.error || "No fue posible registrar el pedido.");
      }

      setCarrito({});
      if (ventanaWhatsApp) ventanaWhatsApp.location.href = resultado.whatsappUrl;
      else window.location.assign(resultado.whatsappUrl);
      setProcesandoWhatsApp(false);
    } catch (error) {
      ventanaWhatsApp?.close();
      setErrorWhatsApp(error instanceof Error ? error.message : "No fue posible registrar el pedido.");
      setProcesandoWhatsApp(false);
    }
  };

  return (
    <main style={styles.main}>
      {mostrarBienvenida && !modoTV && (
        <div style={styles.welcomeBackdrop} role="dialog" aria-modal="true" aria-labelledby="welcome-title">
          <section style={styles.welcomeModal}>
            <button
              type="button"
              onClick={cerrarBienvenida}
              style={styles.welcomeClose}
              aria-label="Cerrar promoción"
            >
              ×
            </button>
            <span style={styles.welcomeEmoji}>🎁</span>
            <span style={styles.welcomeEyebrow}>BENEFICIO DE BIENVENIDA</span>
            <h2 id="welcome-title" style={styles.welcomeTitle}>¡Tu primer envío va por nuestra cuenta!</h2>
            <p style={styles.welcomeCopy}>
              Regístrate por WhatsApp y recibe <strong>envío gratis</strong> en tu primera compra de $300 o más.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP}?text=${mensajeBienvenida}`}
              target="_blank"
              rel="noreferrer"
              onClick={cerrarBienvenida}
              style={styles.welcomeButton}
            >
              Registrarme por WhatsApp
            </a>
            <button type="button" onClick={cerrarBienvenida} style={styles.welcomeLater}>
              Tal vez después
            </button>
            <small style={styles.welcomeLegal}>
              Promoción válida una vez por cliente. Sujeta a cobertura y disponibilidad.
            </small>
          </section>
        </div>
      )}
      <header className="lonjaHeader">
        <div className="lonjaHeaderInner">
          <Image src="/perfil1.png" alt="Logo de Carnicería La Lonja" className="lonjaLogo" width={152} height={152} />
          <div className="lonjaHeaderText">
            <span className="lonjaEyebrow">Mercado Morelos · Local interior 96</span>
            <h1>Carnicería La Lonja</h1>
            <p>Tradición y calidad desde 1900</p>
          </div>
          <a
            className="lonjaHeaderWhatsapp"
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
          <button type="button" onClick={abrirModoTV} style={styles.tvLaunchButton}>
            Modo TV
          </button>
        </div>
      </header>

      {modoTV && (
        <section style={styles.tvOverlay} aria-label="Carrusel de productos para televisión">
          <div style={styles.tvBrand}>Carnicería La Lonja <span style={styles.tvBrandYear}>· Desde 1900</span></div>
          <img
            src={catalogProducts[indiceTV].imagen}
            alt={catalogProducts[indiceTV].nombre}
            style={styles.tvImage}
          />
          <div style={styles.tvShade} />
          <div style={styles.tvContent}>
            <span style={styles.tvCategory}>{catalogProducts[indiceTV].categoria}</span>
            <h2 style={styles.tvTitle}>{catalogProducts[indiceTV].nombre}</h2>
            <p style={styles.tvDescription}>{catalogProducts[indiceTV].descripcion}</p>
            <div style={styles.tvPriceRow}>
              {preciosPromocion[catalogProducts[indiceTV].id] && (
                <span style={styles.tvOldPrice}>${money(catalogProducts[indiceTV].precio)}</span>
              )}
              <strong style={styles.tvPrice}>${money(precioVigente(catalogProducts[indiceTV]))}</strong>
              <span style={styles.tvUnit}>/ {catalogProducts[indiceTV].unidad}</span>
            </div>
          </div>
          <div style={styles.tvFooter}>Mercado Morelos · Local interior 96 · Pedidos por WhatsApp</div>
          <div style={styles.tvControls}>
            <button type="button" onClick={() => setIndiceTV((indiceTV - 1 + catalogProducts.length) % catalogProducts.length)} style={styles.tvControlButton} aria-label="Producto anterior">‹</button>
            <button type="button" onClick={() => setPausadoTV(!pausadoTV)} style={styles.tvPauseButton}>{pausadoTV ? "Reproducir" : "Pausar"}</button>
            <span style={styles.tvCounter}>{indiceTV + 1} / {catalogProducts.length}</span>
            <button type="button" onClick={() => setIndiceTV((indiceTV + 1) % catalogProducts.length)} style={styles.tvControlButton} aria-label="Producto siguiente">›</button>
            <button type="button" onClick={cerrarModoTV} style={styles.tvCloseButton}>Salir</button>
          </div>
        </section>
      )}

      <section className="lonjaHero">
        <Image src="/portada-lonja.png" alt="Carnicería La Lonja desde 1900" className="lonjaHeroImage" width={1600} height={900} priority sizes="(max-width: 1100px) 100vw, 1100px" />
        <div className="lonjaHeroShade" />
        <div className="lonjaHeroContent">
          <div style={styles.badge}>Pedidos directos por WhatsApp</div>
          <h2>Carne fresca, cortes y preparados para tu mesa</h2>
          <p>Arma tu pedido, agrega tus datos y envíalo directamente. El precio final se confirma al pesar y según disponibilidad.</p>
          <a href="#catalogo" className="lonjaHeroButton">Ver catálogo</a>
        </div>
      </section>

      <section className="lonjaExperience">
        <div className="lonjaExperienceHeading">
          <span className="lonjaEyebrow">Más que una carnicería</span>
          <h2>Vive la experiencia La Lonja</h2>
          <p>Participa, escucha música y conoce las promociones de la casa.</p>
        </div>

        <div className="lonjaExperienceGrid">
          <a
            href="https://quiniela-la-lonja-dist.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="lonjaExperienceCard"
          >
            <span className="lonjaExperienceIcon">⚽</span>
            <div>
              <h3>Quiniela La Lonja</h3>
              <p>Participa, registra tus pronósticos y compite por premios.</p>
              <strong>Entrar a la quiniela →</strong>
            </div>
          </a>

          <a
            href="https://la-lonja-music-station.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="lonjaExperienceCard"
          >
            <span className="lonjaExperienceIcon">🎵</span>
            <div>
              <h3>Music Station</h3>
              <p>Pon música para cocinar, trabajar o preparar el asado.</p>
              <strong>Abrir reproductor →</strong>
            </div>
          </a>

          <div className="lonjaExperienceCard lonjaExperienceCardSoon">
            <span className="lonjaExperienceIcon">🔥</span>
            <div>
              <h3>Promociones</h3>
              <p>Próximamente encontrarás aquí ofertas y paquetes especiales.</p>
              <strong>Muy pronto</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="lonjaPromos" id="promociones">
        <div className="lonjaPromosHeading">
          <div>
            <span className="lonjaEyebrow">Ofertas especiales</span>
            <h2>Promociones La Lonja</h2>
            <p>Precios por kilogramo, sujetos a disponibilidad.</p>
          </div>
          <span className="lonjaPromoBadge">Por tiempo limitado</span>
        </div>

        <div className="lonjaPromosGrid">
          {promociones.map((promo) => (
            <article className="lonjaPromoCard" key={promo.productoId}>
              <span className="lonjaPromoIcon">{promo.emoji}</span>
              <div className="lonjaPromoContent">
                <h3>{promo.titulo}</h3>
                <p>{promo.descripcion}</p>
                <div className="lonjaPromoPrices">
                  <span className="lonjaOldPrice">${money(promo.precioNormal)}</span>
                  <strong>${money(promo.precioPromocion)}</strong>
                  <span>/ {promo.unidad}</span>
                </div>
                <button
                  type="button"
                  className="lonjaPromoButton"
                  onClick={() => cambiarCantidad(promo.productoId, 1)}
                >
                  Agregar 1 kg al pedido
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section style={styles.searchBox}>
        <label htmlFor="buscar-productos" style={styles.srOnly}>Buscar productos</label>
        <input
          id="buscar-productos"
          style={styles.input}
          placeholder="Buscar: bistec, chorizo, pollo, queso..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </section>

      <div style={styles.categorias}>
        {catalogCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoria(cat)}
            style={{
              ...styles.catBtn,
              background: categoria === cat ? "#b91c1c" : "#27272a",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <section id="catalogo" style={styles.grid}>
        {productosFiltrados.map((p) => (
          <article key={p.id} style={styles.card}>
            <div style={styles.imageWrap}>
              {p.imagen ? (
                <img src={p.imagen} alt={p.nombre} style={styles.image} width={600} height={420} loading="lazy" decoding="async" />
              ) : (
                <span style={styles.emoji}>{p.emoji}</span>
              )}
            </div>
            <div style={styles.categoryTag}>{p.categoria}</div>
            <h3 style={styles.productTitle}>{p.nombre}</h3>
            <p style={styles.desc}>{p.descripcion}</p>
            <div style={styles.priceBox}>
              {preciosPromocion[p.id] && (
                <span className="lonjaCatalogOldPrice">${money(p.precio)}</span>
              )}
              <span style={styles.price}>${money(precioVigente(p))}</span>
              <span style={styles.unit}> / {p.unidad}</span>
            </div>
            <div style={styles.controls}>
              <button type="button" aria-label={`Quitar ${p.unidad.toLowerCase() === "kg" ? "medio kilo" : "una unidad"} de ${p.nombre}`} onClick={() => cambiarCantidad(p.id, p.unidad.toLowerCase() === "kg" ? -0.5 : -1)} style={styles.qtyBtn}>−</button>
              <strong style={styles.qty}>{carrito[p.id] || 0}</strong>
              <button type="button" aria-label={`Agregar ${p.unidad.toLowerCase() === "kg" ? "medio kilo" : "una unidad"} de ${p.nombre}`} onClick={() => cambiarCantidad(p.id, p.unidad.toLowerCase() === "kg" ? 0.5 : 1)} style={styles.qtyBtn}>+</button>
            </div>
          </article>
        ))}
        {productosFiltrados.length === 0 && (
          <div style={styles.noResults}>
            <strong>No encontramos productos con esos filtros.</strong>
            <span>Prueba otra palabra o selecciona “Todos”.</span>
            <button type="button" onClick={() => { setBusqueda(""); setCategoria("Todos"); }} style={styles.clearFilters}>Limpiar filtros</button>
          </div>
        )}
      </section>

      <section id="checkout" style={styles.checkout}>
        <h2 style={styles.sectionTitle}>Entrega y datos del cliente</h2>
        <div style={styles.formGrid}>
          <label style={styles.inputWide}>¿Cómo recibirás tu pedido?
            <select style={styles.input} value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value as "DELIVERY" | "PICKUP")}>
              <option value="DELIVERY">Entrega a domicilio</option>
              <option value="PICKUP">Recoger en Mercado Morelos, local 96</option>
            </select>
          </label>
          <label style={styles.fieldLabel}>Nombre
            <input style={styles.input} autoComplete="name" value={datos.nombre} onChange={(e) => setDatos({ ...datos, nombre: e.target.value })} />
          </label>
          <label style={styles.fieldLabel}>Teléfono
            <input style={styles.input} type="tel" inputMode="tel" autoComplete="tel" value={datos.telefono} onChange={(e) => setDatos({ ...datos, telefono: e.target.value })} />
          </label>
          {deliveryMethod === "DELIVERY" ? <>
            <label style={styles.fieldLabelWide}>Dirección completa
              <input style={styles.input} autoComplete="street-address" value={datos.direccion} onChange={(e) => setDatos({ ...datos, direccion: e.target.value })} />
            </label>
            <label style={styles.fieldLabelWide}>Referencia para encontrar el domicilio
              <input style={styles.input} placeholder="Color de casa, entre calles o negocio cercano" value={datos.referencia} onChange={(e) => setDatos({ ...datos, referencia: e.target.value })} />
            </label>
          </> : <p style={styles.inputWide}>Recoge en Mercado Morelos, local interior 96. No necesitas escribir domicilio.</p>}
          <label style={styles.fieldLabelWide}>Comentarios opcionales
            <textarea style={styles.textarea} placeholder="Horario, corte especial, menos grasa, etc." value={datos.comentarios} onChange={(e) => setDatos({ ...datos, comentarios: e.target.value })} />
          </label>
        </div>
      </section>

      <section className="lonjaBrandStory">
        <Image src="/logo2034pix.png" alt="Emblema de Carnicería La Lonja" className="lonjaBrandImage" width={1000} height={1000} sizes="(max-width: 760px) 100vw, 45vw" />
        <div>
          <span className="lonjaEyebrow">Cuatro generaciones de tradición</span>
          <h2>La Lonja, desde 1900</h2>
          <p>Carne, cortes y preparados con atención directa desde el corazón del Mercado Morelos.</p>
        </div>
      </section>

      <section id="pedido" style={styles.cart}>
        <h2 style={styles.sectionTitle}>Tu pedido</h2>
        <div style={{ ...styles.orderHoursBanner, ...(horarioPedidos.isOpen ? styles.orderHoursOpen : styles.orderHoursClosed) }}>
          <strong>{horarioPedidos.isOpen ? "🟢 Pedidos abiertos" : "🔒 Pedidos cerrados"}</strong>
          <span>{horarioPedidos.isOpen ? horarioPedidos.message : `Horario: ${ORDER_HOURS_LABEL}, hora de Celaya.`}</span>
        </div>
        {items.length === 0 ? (
          <p style={styles.empty}>Agrega productos para armar tu pedido.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} style={styles.cartItem}>
              <span>{item.nombre} · {item.cantidad} {item.unidad}</span>
              <strong>${money(item.precio * item.cantidad)}</strong>
            </div>
          ))
        )}
        <div style={styles.total}>
          <span>Total aproximado</span>
          <strong>${money(total)}</strong>
        </div>
        {!pedidoValido && <p style={styles.warning}>Agrega producto, nombre, teléfono{deliveryMethod === "DELIVERY" ? " y dirección" : ""}.</p>}
        {!horarioPedidos.isOpen && <p style={styles.closedWarning}>En este momento puedes revisar el catálogo y preparar tu carrito, pero no enviar pedidos.</p>}
        <label style={styles.paymentChoice}>Pago para pedidos por WhatsApp
          <select style={styles.input} value={whatsappPaymentMethod} onChange={(e) => setWhatsAppPaymentMethod(e.target.value as "TRANSFER" | "CASH_ON_DELIVERY")}>
            <option value="TRANSFER">Transferencia bancaria</option>
            <option value="CASH_ON_DELIVERY">Efectivo al recibir</option>
          </select>
        </label>
        {deliveryMethod === "DELIVERY" && whatsappPaymentMethod === "CASH_ON_DELIVERY" && <p style={styles.closedWarning}>La entrega en efectivo queda sujeta a disponibilidad de repartidor. Te confirmaremos por WhatsApp antes de preparar.</p>}
        {whatsappPaymentMethod === "TRANSFER" && <p style={styles.clipNote}>Te enviaremos los datos de transferencia por WhatsApp.</p>}
        <button
          type="button"
          onClick={enviarPorWhatsApp}
          disabled={!pedidoHabilitado || procesandoWhatsApp || procesandoClip}
          style={{ ...styles.whatsapp, opacity: pedidoHabilitado && !procesandoWhatsApp && !procesandoClip ? 1 : 0.45, cursor: pedidoHabilitado && !procesandoWhatsApp && !procesandoClip ? "pointer" : "not-allowed" }}
        >
          {procesandoWhatsApp ? "Registrando pedido…" : horarioPedidos.isOpen ? "Enviar pedido por WhatsApp" : "Pedidos cerrados por horario"}
        </button>
        {errorWhatsApp && <p style={styles.clipError}>{errorWhatsApp}</p>}
        <div style={styles.paymentDivider}><span>o paga en línea</span></div>
        <button
          type="button"
          onClick={pagarConClip}
          disabled={!pedidoHabilitado || procesandoClip}
          style={{ ...styles.clipButton, opacity: pedidoHabilitado && !procesandoClip ? 1 : 0.45, cursor: pedidoHabilitado && !procesandoClip ? "pointer" : "not-allowed" }}
        >
          <span style={styles.clipMark}>clip</span>
          {procesandoClip ? "Preparando pago seguro…" : horarioPedidos.isOpen ? `Pagar ${money(total)} con tarjeta` : "Pago cerrado por horario"}
        </button>
        {errorClip && <p style={styles.clipError}>{errorClip}</p>}
        <p style={styles.clipNote}>Pago procesado de forma segura por Clip. El importe es aproximado y puede ajustarse al confirmar el peso real.</p>
        <p style={styles.small}>Precio final sujeto a peso real y disponibilidad.</p>
      </section>

      <footer style={styles.siteFooter}>
        <span>© Carnicería La Lonja</span>
        <a href="/admin/pedidos" style={styles.adminLink}>Panel de pedidos</a>
      </footer>

      {items.length > 0 && (
        <button type="button" className="lonjaFloatingCart" onClick={() => setCarritoAbierto(true)} aria-haspopup="dialog" aria-expanded={carritoAbierto}>
          <span>🛒 Ver pedido · {money(cantidadArticulos)} {cantidadArticulos === 1 ? "artículo" : "artículos"}</span>
          <strong>${money(total)}</strong>
          <span>Revisar carrito y continuar →</span>
        </button>
      )}

      {carritoAbierto && (
        <div className="lonjaCartBackdrop" role="presentation" onMouseDown={(evento) => { if (evento.target === evento.currentTarget) setCarritoAbierto(false); }}>
          <section className="lonjaCartDrawer" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
            <div className="lonjaCartDrawerHead">
              <div><span>Tu compra</span><h2 id="cart-drawer-title">Revisa tu pedido</h2></div>
              <button type="button" onClick={() => setCarritoAbierto(false)} aria-label="Cerrar carrito">×</button>
            </div>
            <div className="lonjaCartDrawerItems">
              {items.map((item) => (
                <article className="lonjaCartDrawerItem" key={item.id}>
                  <div><strong>{item.nombre}</strong><span>${money(item.precio)} / {item.unidad}</span></div>
                  <div className="lonjaCartDrawerQuantity">
                    <button type="button" aria-label={`Quitar de ${item.nombre}`} onClick={() => cambiarCantidad(item.id, item.unidad.toLowerCase() === "kg" ? -0.5 : -1)}>−</button>
                    <b>{item.cantidad} {item.unidad}</b>
                    <button type="button" aria-label={`Agregar a ${item.nombre}`} onClick={() => cambiarCantidad(item.id, item.unidad.toLowerCase() === "kg" ? 0.5 : 1)}>+</button>
                  </div>
                  <strong>${money(item.precio * item.cantidad)}</strong>
                </article>
              ))}
            </div>
            <div className="lonjaCartDrawerTotal"><span>Total aproximado</span><strong>${money(total)}</strong></div>
            <button type="button" className="lonjaCartContinue" onClick={continuarAlCheckout}>Continuar con entrega y pago</button>
            <button type="button" className="lonjaCartKeepShopping" onClick={() => setCarritoAbierto(false)}>Seguir comprando</button>
            <small>El precio final se confirma según el peso real y la disponibilidad.</small>
          </section>
        </div>
      )}

      {confirmacionProducto && <button type="button" className="lonjaAddConfirmation" onClick={() => { setConfirmacionProducto(""); setCarritoAbierto(true); }} aria-live="polite">✓ {confirmacionProducto}</button>}
    </main>
  );
}

function money(value: number) {
  return value.toLocaleString("es-MX", { maximumFractionDigits: 2 });
}

const styles: Record<string, CSSProperties> = {
  srOnly: { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 },
  main: { minHeight: "100vh", background: "#0f0f0f", color: "white", padding: 16, paddingBottom: 96, fontFamily: "Arial, sans-serif", maxWidth: 1440, margin: "0 auto" },
  welcomeBackdrop: { position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "rgba(0,0,0,.76)", backdropFilter: "blur(6px)" },
  welcomeModal: { position: "relative", width: "min(460px, 100%)", overflow: "hidden", border: "1px solid #facc15", borderRadius: 26, padding: "34px 28px 26px", background: "linear-gradient(145deg, #7f1d1d, #18181b 65%)", color: "white", textAlign: "center", boxShadow: "0 28px 80px rgba(0,0,0,.65)" },
  welcomeClose: { position: "absolute", top: 12, right: 14, width: 38, height: 38, border: "1px solid rgba(255,255,255,.3)", borderRadius: 999, background: "rgba(0,0,0,.25)", color: "white", fontSize: 25, lineHeight: 1, cursor: "pointer" },
  welcomeEmoji: { display: "block", marginBottom: 10, fontSize: 54 },
  welcomeEyebrow: { display: "inline-block", color: "#facc15", fontSize: 12, fontWeight: 900, letterSpacing: 1.4 },
  welcomeTitle: { margin: "10px 0 12px", fontSize: 30, lineHeight: 1.08 },
  welcomeCopy: { margin: "0 auto 22px", maxWidth: 370, color: "#f4f4f5", fontSize: 17, lineHeight: 1.5 },
  welcomeButton: { display: "block", padding: "15px 18px", borderRadius: 15, background: "#16a34a", color: "white", fontSize: 17, fontWeight: 900, textDecoration: "none", boxShadow: "0 8px 22px rgba(0,0,0,.28)" },
  welcomeLater: { marginTop: 12, border: "none", background: "transparent", color: "#e4e4e7", fontSize: 14, textDecoration: "underline", cursor: "pointer" },
  welcomeLegal: { display: "block", marginTop: 16, color: "#d4d4d8", fontSize: 11, lineHeight: 1.4 },
  siteFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 18, padding: "18px 6px 0", borderTop: "1px solid #27272a", color: "#a1a1aa", fontSize: 13 },
  adminLink: { color: "#d4d4d8", textDecoration: "underline", textUnderlineOffset: 3 },
  hero: { background: "linear-gradient(135deg, #7f1d1d, #18181b)", borderRadius: 24, padding: 24, marginBottom: 14, boxShadow: "0 10px 30px rgba(0,0,0,.35)" },
  badge: { display: "inline-block", background: "#facc15", color: "#111", padding: "7px 12px", borderRadius: 999, fontWeight: "bold", fontSize: 13, marginBottom: 14 },
  title: { fontSize: 34, margin: 0, fontWeight: 900 },
  subtitle: { color: "#e5e5e5", marginTop: 6 },
  copy: { color: "#f4f4f5", lineHeight: 1.4, maxWidth: 680 },
  searchBox: { marginBottom: 12 },
  categorias: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 },
  noResults: { gridColumn: "1 / -1", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "42px 20px", border: "1px dashed #52525b", borderRadius: 18, color: "#e4e4e7", textAlign: "center" },
  clearFilters: { marginTop: 6, border: "1px solid #71717a", borderRadius: 999, padding: "9px 14px", background: "#27272a", color: "white", fontWeight: 800, cursor: "pointer" },
  fieldLabel: { display: "flex", flexDirection: "column", gap: 7, color: "#e4e4e7", fontSize: 13, fontWeight: 800 },
  fieldLabelWide: { gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 7, color: "#e4e4e7", fontSize: 13, fontWeight: 800 },
  catBtn: { color: "white", border: "1px solid #3f3f46", padding: "11px 16px", borderRadius: 999, cursor: "pointer", fontWeight: "bold" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16 },
  card: { background: "#18181b", border: "1px solid #3f3f46", padding: 16, borderRadius: 22, position: "relative" },
  imageWrap: { width: "100%", aspectRatio: "1 / 1", background: "#27272a", borderRadius: 16, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  emoji: { fontSize: 54 },
  categoryTag: { display: "inline-block", background: "#27272a", color: "#facc15", padding: "5px 9px", borderRadius: 999, fontSize: 12, fontWeight: "bold", marginBottom: 8 },
  productTitle: { margin: "6px 0", fontSize: 19 },
  desc: { color: "#d4d4d8", minHeight: 54, lineHeight: 1.35, fontSize: 14 },
  priceBox: { marginTop: 10, marginBottom: 14 },
  price: { fontSize: 27, fontWeight: 900, color: "#facc15" },
  unit: { color: "#d4d4d8" },
  controls: { display: "flex", alignItems: "center", gap: 14 },
  qtyBtn: { background: "#b91c1c", color: "white", border: "none", width: 42, height: 42, borderRadius: 14, fontSize: 24, fontWeight: "bold", cursor: "pointer" },
  qty: { fontSize: 20, minWidth: 35, textAlign: "center" },
  checkout: { marginTop: 22, background: "#18181b", border: "1px solid #3f3f46", padding: 18, borderRadius: 22 },
  sectionTitle: { marginTop: 0 },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 },
  input: { background: "#0f0f0f", color: "white", border: "1px solid #3f3f46", borderRadius: 14, padding: 13, fontSize: 15 },
  inputWide: { background: "#0f0f0f", color: "white", border: "1px solid #3f3f46", borderRadius: 14, padding: 13, fontSize: 15, gridColumn: "1 / -1" },
  textarea: { background: "#0f0f0f", color: "white", border: "1px solid #3f3f46", borderRadius: 14, padding: 13, fontSize: 15, minHeight: 90, gridColumn: "1 / -1" },
  cart: { marginTop: 22, background: "#18181b", border: "1px solid #3f3f46", padding: 20, borderRadius: 22 },
  empty: { color: "#d4d4d8" },
  cartItem: { display: "flex", justifyContent: "space-between", gap: 12, borderBottom: "1px solid #3f3f46", padding: "10px 0" },
  total: { display: "flex", justifyContent: "space-between", fontSize: 22, marginTop: 18, marginBottom: 10 },
  warning: { color: "#facc15", fontSize: 13 },
  paymentChoice: { display: "grid", gap: 8, color: "#f4f4f5", fontSize: 14, fontWeight: 700, marginBottom: 12 },
  closedWarning: { margin: "10px 0", padding: 12, borderRadius: 12, background: "#450a0a", color: "#fecaca", fontSize: 13, lineHeight: 1.45 },
  orderHoursBanner: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 15, padding: "13px 15px", borderRadius: 14, fontSize: 13 },
  orderHoursOpen: { background: "#052e16", border: "1px solid #166534", color: "#bbf7d0" },
  orderHoursClosed: { background: "#450a0a", border: "1px solid #991b1b", color: "#fecaca" },
  whatsapp: { background: "#16a34a", color: "white", border: "none", width: "100%", padding: 16, borderRadius: 16, fontSize: 18, fontWeight: "bold", cursor: "pointer" },
  paymentDivider: { display: "flex", alignItems: "center", justifyContent: "center", margin: "15px 0 12px", color: "#a1a1aa", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 },
  clipButton: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, width: "100%", padding: 16, border: "none", borderRadius: 16, background: "#ff5a1f", color: "white", fontSize: 18, fontWeight: 900, cursor: "pointer" },
  clipMark: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 28, borderRadius: 8, background: "white", color: "#ff5a1f", fontSize: 16, fontWeight: 900, textTransform: "lowercase" },
  clipError: { margin: "10px 0 0", padding: 11, borderRadius: 12, background: "#450a0a", color: "#fecaca", fontSize: 13 },
  clipNote: { margin: "10px 0 0", color: "#d4d4d8", fontSize: 12, lineHeight: 1.4, textAlign: "center" },
  small: { color: "#a1a1aa", fontSize: 12, marginTop: 10 },
  tvLaunchButton: { background: "#facc15", color: "#18181b", border: "none", borderRadius: 999, padding: "11px 16px", fontWeight: 900, cursor: "pointer" },
  tvOverlay: { position: "fixed", inset: 0, zIndex: 9999, overflow: "hidden", background: "#090909", color: "white", fontFamily: "Arial, sans-serif" },
  tvImage: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" },
  tvShade: { position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,.94) 0%, rgba(0,0,0,.68) 42%, rgba(0,0,0,.12) 75%), linear-gradient(0deg, rgba(0,0,0,.75), transparent 42%)" },
  tvBrand: { position: "absolute", zIndex: 2, top: "5vh", left: "5vw", fontSize: "clamp(22px, 2.5vw, 44px)", fontWeight: 900, color: "#facc15", textShadow: "0 3px 14px #000" },
  tvBrandYear: { color: "white", fontWeight: 600 },
  tvContent: { position: "absolute", zIndex: 2, left: "5vw", top: "50%", transform: "translateY(-50%)", width: "min(720px, 55vw)" },
  tvCategory: { display: "inline-block", background: "#b91c1c", borderRadius: 999, padding: "10px 18px", fontSize: "clamp(16px, 1.5vw, 26px)", fontWeight: 800 },
  tvTitle: { margin: "20px 0 14px", fontSize: "clamp(44px, 6vw, 104px)", lineHeight: .95, textTransform: "uppercase", textShadow: "0 4px 24px #000" },
  tvDescription: { fontSize: "clamp(18px, 2vw, 34px)", lineHeight: 1.3, margin: 0, color: "#f4f4f5", textShadow: "0 3px 14px #000" },
  tvPriceRow: { display: "flex", alignItems: "baseline", gap: 14, marginTop: 28 },
  tvOldPrice: { color: "#d4d4d8", fontSize: "clamp(24px, 2.5vw, 42px)", textDecoration: "line-through" },
  tvPrice: { color: "#facc15", fontSize: "clamp(54px, 7vw, 118px)", lineHeight: 1 },
  tvUnit: { fontSize: "clamp(20px, 2vw, 36px)" },
  tvFooter: { position: "absolute", zIndex: 2, left: "5vw", bottom: "4vh", fontSize: "clamp(16px, 1.5vw, 28px)", fontWeight: 700, textShadow: "0 3px 12px #000" },
  tvControls: { position: "absolute", zIndex: 3, right: 24, bottom: 24, display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 18, background: "rgba(0,0,0,.62)", backdropFilter: "blur(8px)" },
  tvControlButton: { width: 48, height: 48, border: "1px solid #71717a", borderRadius: 14, background: "#27272a", color: "white", fontSize: 32, cursor: "pointer" },
  tvPauseButton: { height: 48, border: "none", borderRadius: 14, background: "#facc15", color: "#18181b", padding: "0 18px", fontWeight: 900, cursor: "pointer" },
  tvCounter: { minWidth: 60, textAlign: "center", fontWeight: 800 },
  tvCloseButton: { height: 48, border: "none", borderRadius: 14, background: "#b91c1c", color: "white", padding: "0 18px", fontWeight: 900, cursor: "pointer" },
};
