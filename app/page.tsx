"use client";

import { CSSProperties, useMemo, useState } from "react";

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
    "id": "PCB1",
    "nombre": "BISTEC DE CERDO",
    "categoria": "Cerdo",
    "precio": 160,
    "unidad": "kg",
    "descripcion": "PIERNA DE CERDO BISTECEADA Y APLANADA PARA MILANESA O FREIR",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐖"
  },
  {
    "id": "PCF2",
    "nombre": "PIERNA DE CERDO PA FREIR",
    "categoria": "Cerdo",
    "precio": 160,
    "unidad": "kg",
    "descripcion": "PIERNA DE CERDO EN TROCITOS PARA FREIR",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐖"
  },
  {
    "id": "PCAR3",
    "nombre": "ARRACHERA MARINADA",
    "categoria": "Cerdo",
    "precio": 140,
    "unidad": "kg",
    "descripcion": "PIERNA DE CERDO BISTECEADA EN CORTE DELGADO Y MARINADA PARA ARRACHERA PARA ASAR",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐖"
  },
  {
    "id": "PCPAS4",
    "nombre": "BISTEC DE CERDO AL PASTOR",
    "categoria": "Cerdo",
    "precio": 140,
    "unidad": "kg",
    "descripcion": "PIERNA DE CERDO BISTECEADA EN CORTE DELGADO Y MARINADA AL PASTOR",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐖"
  },
  {
    "id": "PCMO5",
    "nombre": "MOLIDA",
    "categoria": "Cerdo",
    "precio": 140,
    "unidad": "kg",
    "descripcion": "PIERNA DE CERDO MOLIDA EN TAMAÑO DELGADO PARA HACER ALBONDIGAS",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐖"
  },
  {
    "id": "PCMOPAS6",
    "nombre": "MOLIDA AL PASTOR",
    "categoria": "Cerdo",
    "precio": 140,
    "unidad": "kg",
    "descripcion": "PIERNA DE CERDO MOLIDA EN CORTE GRUESO Y MARINADA AL PASTOR",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐖"
  },
  {
    "id": "CMA1",
    "nombre": "MANITAS",
    "categoria": "Cerdo",
    "precio": 85,
    "unidad": "kg",
    "descripcion": "MANITAS DE CERDO (ESPECIFICAR SU CORTE EN 2 O 4 PZAS)",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐖"
  },
  {
    "id": "CCHD1",
    "nombre": "CHICHARRON",
    "categoria": "Cerdo",
    "precio": 200,
    "unidad": "kg",
    "descripcion": "CHICHARRON DE CERDO DELGADO O RAYADO",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐖"
  },
  {
    "id": "CCHC2",
    "nombre": "CHICHARRON CON CARNE",
    "categoria": "Cerdo",
    "precio": 260,
    "unidad": "kg",
    "descripcion": "CHICHARRON DE CERDO CON CARNE",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐖"
  },
  {
    "id": "CCHAH1",
    "nombre": "CHULETA AHUMADA",
    "categoria": "Cerdo",
    "precio": 130,
    "unidad": "kg",
    "descripcion": "CHULETA AHUMADA DE CERDO",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐖"
  },
  {
    "id": "CCHN1",
    "nombre": "CHULETA DE CERDO NATURAL",
    "categoria": "Cerdo",
    "precio": 150,
    "unidad": "kg",
    "descripcion": "CHULETA DE CERDO NATURAL REBANADA Y APLANADA",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐖"
  },
  {
    "id": "CMIG1",
    "nombre": "MIGAJAS PA GORDITAS",
    "categoria": "Cerdo",
    "precio": 150,
    "unidad": "kg",
    "descripcion": "MIGAJAS PA GORDITAS",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐖"
  },
  {
    "id": "CCAR1",
    "nombre": "CARRILLERA",
    "categoria": "Cerdo",
    "precio": 180,
    "unidad": "kg",
    "descripcion": "CARRILLERA DE CERDO PARA BARBECUE",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐖"
  },
  {
    "id": "CCARN1",
    "nombre": "CARNITAS",
    "categoria": "Cerdo",
    "precio": 360,
    "unidad": "kg",
    "descripcion": "CARNITAS DE CERDO SURTIDAS(MACISA, CUERO, COSTILLA)",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐖"
  },
  {
    "id": "CBU1",
    "nombre": "BUCHE",
    "categoria": "Cerdo",
    "precio": 120,
    "unidad": "kg",
    "descripcion": "BUCHE DE CERDO CONGELADO",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐖"
  },
  {
    "id": "CCHOG1",
    "nombre": "CHORIZO A GRANEL",
    "categoria": "Cerdo",
    "precio": 120,
    "unidad": "kg",
    "descripcion": "CHORIZO DE CERDO 80/20 A GRANEL PARA FREIR",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐖"
  },
  {
    "id": "CMANB1",
    "nombre": "MANTECA BLANCA",
    "categoria": "Cerdo",
    "precio": 60,
    "unidad": "kg",
    "descripcion": "MANTECA BLANCA DE CERDO",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐖"
  },
  {
    "id": "CTOCN1",
    "nombre": "TOCINETA",
    "categoria": "Cerdo",
    "precio": 160,
    "unidad": "kg",
    "descripcion": "TOCINETA DE CERDO NATURAL REBANADA(CONGELADA PARA SU MEJOR CORTE)",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐖"
  },
  {
    "id": "CTOCMA2",
    "nombre": "TOCINETA MARINADA",
    "categoria": "Cerdo",
    "precio": 160,
    "unidad": "kg",
    "descripcion": "TOCINETA MARINADA PARA ASAR(PUEDE SER CONGELADA)",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐖"
  },
  {
    "id": "CTOCADO3",
    "nombre": "TOCINETA ADOBADA",
    "categoria": "Cerdo",
    "precio": 160,
    "unidad": "kg",
    "descripcion": "TOCINETA DE CERDO ADOBADA(PUEDE SER CONGELADA)",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐖"
  },
  {
    "id": "CHUEPZ1",
    "nombre": "HUESO PA POZOLE",
    "categoria": "Cerdo",
    "precio": 30,
    "unidad": "kg",
    "descripcion": "HUESO DE CERDO PA POZOLE(PUEDE SER CONGELADO SEGÚN EXISTENCIAS)",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐖"
  },
  {
    "id": "CCHIS1",
    "nombre": "CHISTORRA",
    "categoria": "Res",
    "precio": 180,
    "unidad": "kg",
    "descripcion": "CHISTORRA DE CERDO Y RES EMPACADA AL VACIO",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "CCAB1",
    "nombre": "CABEZA",
    "categoria": "Res",
    "precio": 45,
    "unidad": "kg",
    "descripcion": "CABEZA DE CERDO(PUEDE SER FRESCA O CONGELADA SEGÚN EXISTENCIAS, SE PUEDE PARTIR EN 2 O EN 4 PARTES, SE VENDE MINIMO UNA MITAD)",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "CCHAM1",
    "nombre": "CHAMORRO",
    "categoria": "Res",
    "precio": 100,
    "unidad": "kg",
    "descripcion": "CHAMORRO DE CERDO( SE PUEDE VENDER ENTERO O TROZEADO)PUEDE SER FRESCO O CONGELADO SEGÚN EXISTENCIAS",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "CR8020FR1",
    "nombre": "CARNE PA FREIR 80/20",
    "categoria": "Cerdo",
    "precio": 120,
    "unidad": "kg",
    "descripcion": "CARNE DE CERDO PA FREIR DE RECORTE 80/20",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐖"
  },
  {
    "id": "CCHOAS2",
    "nombre": "CHORIZO PA ASAR AMARRADO",
    "categoria": "Cerdo",
    "precio": 150,
    "unidad": "kg",
    "descripcion": "CHORIZO DE CERDO 80/20 PA ASAR",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐖"
  },
  {
    "id": "CCHOARG3",
    "nombre": "CHORIZO ARGENTINO",
    "categoria": "Cerdo",
    "precio": 150,
    "unidad": "kg",
    "descripcion": "CHORIZO ARGENTINO",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐖"
  },
  {
    "id": "CCHOLON4",
    "nombre": "LONGANIZA",
    "categoria": "Res",
    "precio": 150,
    "unidad": "kg",
    "descripcion": "LONGANIZA DE CERDO Y RES 80/20",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "CR8020MOLPT2",
    "nombre": "MOLIDA PARA TACOS",
    "categoria": "Cerdo",
    "precio": 120,
    "unidad": "kg",
    "descripcion": "RECORTE 80/20 MOLIDO PARA TACOS CORTE GRUESO",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐖"
  },
  {
    "id": "CLOM1",
    "nombre": "LOMO",
    "categoria": "Cerdo",
    "precio": 140,
    "unidad": "kg",
    "descripcion": "LOMO DE CERDO( SE PUEDE VENDER POR CAÑA ENTERA O BISTECEADO Y APLANADO PARA MILANEZAS)",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐖"
  },
  {
    "id": "CPF1",
    "nombre": "PUNTAS DE FILETE",
    "categoria": "Pescado",
    "precio": 180,
    "unidad": "kg",
    "descripcion": "PUNTAS DE FILETE(SE PUEDE VENDER LA PIEZA ENTERA O BISTECEADO Y APLANADO PARA BISTECES)",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐟"
  },
  {
    "id": "MAR1",
    "nombre": "MAIZ ROJO",
    "categoria": "Cerdo",
    "precio": 55,
    "unidad": "kg",
    "descripcion": "MAIZ ROJO EMPACADO AL VACIO PA POZOLE",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐖"
  },
  {
    "id": "MAB2",
    "nombre": "MAIZ BLANCO",
    "categoria": "Varios",
    "precio": 40,
    "unidad": "kg",
    "descripcion": "MAIZ BLANCO PARA POZLE EMPACADO AL VACIO",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🛒"
  },
  {
    "id": "CCHUES1",
    "nombre": "CHULETA ESTRELLA",
    "categoria": "Cerdo",
    "precio": 150,
    "unidad": "kg",
    "descripcion": "CHULETA ESTRELLA PA ASAR( SE VENDE CONGELADA PARA SU MEJOR CORTE)",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐖"
  },
  {
    "id": "CCHOVDE5",
    "nombre": "CHORIZO VERDE",
    "categoria": "Cerdo",
    "precio": 180,
    "unidad": "kg",
    "descripcion": "CHORIZO VERDE PA ASAR 80/20",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐖"
  },
  {
    "id": "RBA1",
    "nombre": "RES PARA BARBACOA",
    "categoria": "Res",
    "precio": 240,
    "unidad": "kg",
    "descripcion": "CARNE DE RES PARA HACER BARBACOA(COSTILLA, DIEZMILLO Y MACIZA)",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "RSE1",
    "nombre": "SESOS",
    "categoria": "Res",
    "precio": 180,
    "unidad": "kg",
    "descripcion": "SESOS DE RES CONGELADOS",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "RMEPR1",
    "nombre": "MENUDO PRECOCIDO",
    "categoria": "Res",
    "precio": 120,
    "unidad": "kg",
    "descripcion": "MENUDO FRESCO PRECOCIDO(PANZA, CAYO, PANAL Y LIBRO)",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "RTRI1",
    "nombre": "TRIPAS",
    "categoria": "Res",
    "precio": 130,
    "unidad": "kg",
    "descripcion": "TRIPAS DE RES PA PACHARELAS(POR LO GENERAL VIENE FRESCO A ALGUNAS ESCEPCIONES)",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "RBIFA1",
    "nombre": "FAJITAS DE RES",
    "categoria": "Pescado",
    "precio": 260,
    "unidad": "kg",
    "descripcion": "BISTECES DE RES FILETEADOS EN LAMINAS",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐟"
  },
  {
    "id": "RCHMCH1",
    "nombre": "CHAMBARETE CON HUESO PA COCIDO",
    "categoria": "Res",
    "precio": 230,
    "unidad": "kg",
    "descripcion": "CHAMBARETE CON HUESO PA COCIDO",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "RCHMSH2",
    "nombre": "CHAMBARETE SIN HUESO PA COCIDO",
    "categoria": "Res",
    "precio": 240,
    "unidad": "kg",
    "descripcion": "CHAMBARETE SIN HUESO PA COCIDO",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "RPA1",
    "nombre": "PATA DE RES PRECOCIDA",
    "categoria": "Res",
    "precio": 100,
    "unidad": "kg",
    "descripcion": "PATA DE RES PRECOCIDA REBANADA",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "RTUE1",
    "nombre": "HUESO DE TUETANO",
    "categoria": "Res",
    "precio": 90,
    "unidad": "kg",
    "descripcion": "HUESO DE TUETANOS REBANADOS A LO LARGO O EN RUEDAS",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "RFAL1",
    "nombre": "FALDA PA DESEBRAR",
    "categoria": "Res",
    "precio": 260,
    "unidad": "kg",
    "descripcion": "FALDA DE RES PARA DESEBRAR",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "RCAB1",
    "nombre": "CABEZA DE RES",
    "categoria": "Res",
    "precio": 90,
    "unidad": "kg",
    "descripcion": "CABEZA DE RES (SE VENDE POR MITAN MINIMO)INCLUYE LENGUA Y SESOS",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "RARM2",
    "nombre": "ARRACHERA MARINADA DE RES",
    "categoria": "Res",
    "precio": 260,
    "unidad": "kg",
    "descripcion": "ARRACHERA MARINADA DE RES PA ASAR",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "RCHU1",
    "nombre": "CHULETA DE RES",
    "categoria": "Res",
    "precio": 240,
    "unidad": "kg",
    "descripcion": "CHULETA DE RES PA ASAR (PUEDE VENIR CONGELADA PARA MEJOR CORTE)",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "RCOC1",
    "nombre": "CARNE PA COCIDO",
    "categoria": "Res",
    "precio": 240,
    "unidad": "kg",
    "descripcion": "CARNE DE RES PA COCIDO (CHAMBARETE, COSTILLA Y MACISA)",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "RSUA1",
    "nombre": "SUADERO",
    "categoria": "Res",
    "precio": 240,
    "unidad": "kg",
    "descripcion": "SUDAERO DE RES",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "RMED1",
    "nombre": "MEDULA",
    "categoria": "Res",
    "precio": 160,
    "unidad": "kg",
    "descripcion": "MEDULA DE RES CONGELADA",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "RPIC1",
    "nombre": "PICAÑA",
    "categoria": "Res",
    "precio": 280,
    "unidad": "kg",
    "descripcion": "PICAÑA DE RES (CORTE DE 200GR)",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "RAGN1",
    "nombre": "AGUJA NORTEÑA",
    "categoria": "Res",
    "precio": 240,
    "unidad": "kg",
    "descripcion": "CORTE DE RES AGUJA NORTEÑA PA ASAR",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "RVIR1",
    "nombre": "VIRIL PA COCTAIL",
    "categoria": "Res",
    "precio": 180,
    "unidad": "kg",
    "descripcion": "BOLSA DE VIRIL EN VINAGRE PA HACER COCTAIL",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "RLENG1",
    "nombre": "LENGUA",
    "categoria": "Res",
    "precio": 350,
    "unidad": "kg",
    "descripcion": "LENGUA DE RES PZA CONGELADA",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "RRIB1",
    "nombre": "RIB EYE",
    "categoria": "Res",
    "precio": 320,
    "unidad": "kg",
    "descripcion": "CORTE DE RES PA ASAR RIB EYE",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "RNEW1",
    "nombre": "NEW YORK",
    "categoria": "Res",
    "precio": 320,
    "unidad": "kg",
    "descripcion": "CORTE DE RES PA ASAR NEW YORK",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "RBIS1",
    "nombre": "BISTEC DE RES",
    "categoria": "Res",
    "precio": 260,
    "unidad": "kg",
    "descripcion": "PULPA DE RES BISTECEADA Y APLANADA FRESCO",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "RMOL1",
    "nombre": "MOLIDA DE RES",
    "categoria": "Res",
    "precio": 260,
    "unidad": "kg",
    "descripcion": "CARNE MAGRA DE RES 90/10 MOLIDA, CORTE DELGADO",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "RHIG1",
    "nombre": "HIGADO DE RES",
    "categoria": "Res",
    "precio": 110,
    "unidad": "kg",
    "descripcion": "HIGADO DE RES FRESCO LAMINADO",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "RCECADB1",
    "nombre": "CECINA DE RES ADOBADA FRESCA",
    "categoria": "Res",
    "precio": 280,
    "unidad": "kg",
    "descripcion": "PULPA DE RES BISTECEADA EN LAMINA ADOBADA, LIMON Y SAL",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "RCEFRS1",
    "nombre": "CECINA DE RES FRESCA",
    "categoria": "Res",
    "precio": 280,
    "unidad": "kg",
    "descripcion": "PULPA DE RES BISTECEADA EN LAMINA FRESCA CON SAL Y LIMON",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "RCMOLD1",
    "nombre": "MOLIDA MIXTA",
    "categoria": "Res",
    "precio": 180,
    "unidad": "kg",
    "descripcion": "CARNE DE RES Y CERDO 50/50 MOLIDA",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "RPESMOL2",
    "nombre": "MOLIDA PA JUGO",
    "categoria": "Res",
    "precio": 260,
    "unidad": "kg",
    "descripcion": "CARNE DE PESCUEZO MOLIDA PARA HACER EN SU JUGO(TARTARA)",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "RCESEC3",
    "nombre": "CECINA DE RES SECA",
    "categoria": "Res",
    "precio": 1000,
    "unidad": "kg",
    "descripcion": "PULPA DE RES BISTECEADA Y APLANADA SECA CON SAL Y LIMON",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🥩"
  },
  {
    "id": "POPECSH1",
    "nombre": "PECHUGA SIN HUESO",
    "categoria": "Pollo",
    "precio": 180,
    "unidad": "kg",
    "descripcion": "PECHUGA SIN HUESO FRESCA",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🍗"
  },
  {
    "id": "POPECSHMO2",
    "nombre": "PECHUGA SIN HUESO MOLIDA",
    "categoria": "Pollo",
    "precio": 180,
    "unidad": "kg",
    "descripcion": "PECHUGA DE POLLO FRESCA MOLIDA",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🍗"
  },
  {
    "id": "PO1",
    "nombre": "POLLO",
    "categoria": "Pollo",
    "precio": 130,
    "unidad": "kg",
    "descripcion": "POLLO ENTERO SIN CABEZAS NI MENUDENCIAS PARTIDO(FRESCO)",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🍗"
  },
  {
    "id": "POPYM2",
    "nombre": "PIERNA Y MUSLO",
    "categoria": "Pollo",
    "precio": 130,
    "unidad": "kg",
    "descripcion": "PIERNA Y MUSLO DE POLLO FRESCO",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🍗"
  },
  {
    "id": "POHUE1",
    "nombre": "HUEVO FRESCO",
    "categoria": "Pollo",
    "precio": 90,
    "unidad": "kg",
    "descripcion": "CAJA DE HUEVO FRESCO 12 PZAS",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🍗"
  },
  {
    "id": "POALHT1",
    "nombre": "ALITAS HOT WINGS",
    "categoria": "Pollo",
    "precio": 120,
    "unidad": "kg",
    "descripcion": "ALITAS DE POLLO PICOSITAS HOT WINGS FRESCAS",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🍗"
  },
  {
    "id": "POMIL3",
    "nombre": "MILANESA DE POLLO",
    "categoria": "Pollo",
    "precio": 180,
    "unidad": "kg",
    "descripcion": "PECHUGA FRESCA BISTECEADA Y APLANADA PA MILANEZAS",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🍗"
  },
  {
    "id": "PESTIL1",
    "nombre": "FILTE TILAPIA",
    "categoria": "Pescado",
    "precio": 120,
    "unidad": "kg",
    "descripcion": "FILETE DE PESCADO TILAPIA CONGELADO 70/30",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🐟"
  },
  {
    "id": "QASA1",
    "nombre": "QUESO ASADERO",
    "categoria": "Lácteos",
    "precio": 200,
    "unidad": "kg",
    "descripcion": "QUESO ASADERO FRESCO",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🧀"
  },
  {
    "id": "QRAN1",
    "nombre": "QUESO RANCHERO",
    "categoria": "Lácteos",
    "precio": 200,
    "unidad": "kg",
    "descripcion": "QUESO FRESCO RANCHERO",
    "imagen": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/453073141_896589479152406_8211929632676250059_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=V6h6yt-g3LUQ7kNvwH3KsZB&_nc_oc=Adnr4P5exySrAg1XdYyzt8fA6LIRhs-gRaq71s4b-Afpp_7NaPA7LRWgRCzAuSVwVts&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=NqDp0nnp4ja_CT6YfmFQ5A&oh=00_AfqNWevjzsVWYPJUiPZ9y5Q4V0oYTuqeups6h-Mt7UPBwQ&oe=696DA75B",
    "emoji": "🧀"
  }
];

const categorias = ["Todos", "Res", "Cerdo", "Pollo", "Pescado", "Lácteos", "Varios"];

export default function Home() {
  const [carrito, setCarrito] = useState<Record<string, number>>({});
  const [categoria, setCategoria] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [datos, setDatos] = useState<DatosCliente>({
    nombre: "",
    telefono: "",
    direccion: "",
    referencia: "",
    comentarios: "",
  });

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return productos.filter((p) => {
      const porCategoria = categoria === "Todos" || p.categoria === categoria;
      const porTexto = !texto || `${p.nombre} ${p.descripcion}`.toLowerCase().includes(texto);
      return porCategoria && porTexto;
    });
  }, [categoria, busqueda]);

  const cambiarCantidad = (id: string, delta: number) => {
    setCarrito((prev) => {
      const actual = prev[id] || 0;
      const nuevo = Math.max(0, Math.round((actual + delta) * 10) / 10);
      return { ...prev, [id]: nuevo };
    });
  };

  const items = Object.entries(carrito)
    .filter(([, cantidad]) => cantidad > 0)
    .map(([id, cantidad]) => {
      const producto = productos.find((p) => p.id === id)!;
      return { ...producto, cantidad };
    });

  const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  const pedidoValido = items.length > 0 && datos.nombre.trim() && datos.telefono.trim() && datos.direccion.trim();

  const mensaje = encodeURIComponent(
    "Pedido Carnicería La Lonja\n\n" +
      `Cliente: ${datos.nombre || "Pendiente"}\n` +
      `Teléfono: ${datos.telefono || "Pendiente"}\n` +
      `Dirección: ${datos.direccion || "Pendiente"}\n` +
      `Referencia: ${datos.referencia || "Sin referencia"}\n\n` +
      "Productos:\n" +
      items
        .map(
          (i) =>
            `- ${i.nombre}: ${i.cantidad} ${i.unidad} = $${money(i.precio * i.cantidad)}`
        )
        .join("\n") +
      `\n\nTotal aproximado: $${money(total)} MXN` +
      `\nComentarios: ${datos.comentarios || "Sin comentarios"}` +
      "\n\nPrecio final sujeto a peso real y disponibilidad."
  );

  return (
    <main style={styles.main}>
      <section style={styles.hero}>
        <div style={styles.badge}>Pedidos directos por WhatsApp</div>
        <h1 style={styles.title}>Carnicería La Lonja</h1>
        <p style={styles.subtitle}>Tradición desde 1900 · Mercado Morelos</p>
        <p style={styles.copy}>Arma tu pedido, agrega tu dirección y mándalo directo. Confirmamos precio final al pesar.</p>
      </section>

      <section style={styles.searchBox}>
        <input
          style={styles.input}
          placeholder="Buscar: bistec, chorizo, pollo, queso..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </section>

      <div style={styles.categorias}>
        {categorias.map((cat) => (
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

      <section style={styles.grid}>
        {productosFiltrados.map((p) => (
          <article key={p.id} style={styles.card}>
            <div style={styles.imageWrap}>
              {p.imagen ? (
                <img src={p.imagen} alt={p.nombre} style={styles.image} />
              ) : (
                <span style={styles.emoji}>{p.emoji}</span>
              )}
            </div>
            <div style={styles.categoryTag}>{p.categoria}</div>
            <h3 style={styles.productTitle}>{p.nombre}</h3>
            <p style={styles.desc}>{p.descripcion}</p>
            <div style={styles.priceBox}>
              <span style={styles.price}>${money(p.precio)}</span>
              <span style={styles.unit}> / {p.unidad}</span>
            </div>
            <div style={styles.controls}>
              <button onClick={() => cambiarCantidad(p.id, p.unidad.toLowerCase() === "kg" ? -0.5 : -1)} style={styles.qtyBtn}>−</button>
              <strong style={styles.qty}>{carrito[p.id] || 0}</strong>
              <button onClick={() => cambiarCantidad(p.id, p.unidad.toLowerCase() === "kg" ? 0.5 : 1)} style={styles.qtyBtn}>+</button>
            </div>
          </article>
        ))}
      </section>

      <section style={styles.checkout}>
        <h2 style={styles.sectionTitle}>Datos para entrega</h2>
        <div style={styles.formGrid}>
          <input style={styles.input} placeholder="Nombre" value={datos.nombre} onChange={(e) => setDatos({ ...datos, nombre: e.target.value })} />
          <input style={styles.input} placeholder="Teléfono" value={datos.telefono} onChange={(e) => setDatos({ ...datos, telefono: e.target.value })} />
          <input style={styles.inputWide} placeholder="Dirección completa" value={datos.direccion} onChange={(e) => setDatos({ ...datos, direccion: e.target.value })} />
          <input style={styles.inputWide} placeholder="Referencia: color de casa, entre calles, negocio cercano..." value={datos.referencia} onChange={(e) => setDatos({ ...datos, referencia: e.target.value })} />
          <textarea style={styles.textarea} placeholder="Comentarios: horario, corte especial, menos grasa, etc." value={datos.comentarios} onChange={(e) => setDatos({ ...datos, comentarios: e.target.value })} />
        </div>
      </section>

      <section style={styles.cart}>
        <h2 style={styles.sectionTitle}>Tu pedido</h2>
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
        {!pedidoValido && <p style={styles.warning}>Para enviar, agrega producto, nombre, teléfono y dirección.</p>}
        <a href={pedidoValido ? `https://wa.me/${WHATSAPP}?text=${mensaje}` : "#"} target="_blank" style={{ textDecoration: "none" }}>
          <button style={{ ...styles.whatsapp, opacity: pedidoValido ? 1 : 0.55 }}>Enviar pedido por WhatsApp</button>
        </a>
        <p style={styles.small}>Precio final sujeto a peso real y disponibilidad.</p>
      </section>
    </main>
  );
}

function money(value: number) {
  return value.toLocaleString("es-MX", { maximumFractionDigits: 2 });
}

const styles: Record<string, CSSProperties> = {
  main: { minHeight: "100vh", background: "#0f0f0f", color: "white", padding: 16, fontFamily: "Arial, sans-serif" },
  hero: { background: "linear-gradient(135deg, #7f1d1d, #18181b)", borderRadius: 24, padding: 24, marginBottom: 14, boxShadow: "0 10px 30px rgba(0,0,0,.35)" },
  badge: { display: "inline-block", background: "#facc15", color: "#111", padding: "7px 12px", borderRadius: 999, fontWeight: "bold", fontSize: 13, marginBottom: 14 },
  title: { fontSize: 34, margin: 0, fontWeight: 900 },
  subtitle: { color: "#e5e5e5", marginTop: 6 },
  copy: { color: "#f4f4f5", lineHeight: 1.4, maxWidth: 680 },
  searchBox: { marginBottom: 12 },
  categorias: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 },
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
  whatsapp: { background: "#16a34a", color: "white", border: "none", width: "100%", padding: 16, borderRadius: 16, fontSize: 18, fontWeight: "bold", cursor: "pointer" },
  small: { color: "#a1a1aa", fontSize: 12, marginTop: 10 },
};
