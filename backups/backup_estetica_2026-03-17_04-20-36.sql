--
-- PostgreSQL database dump
--

\restrict 1gY3rlmXMXtYlsxc5za6gKXoAmsB7pFf0HrNRHfds7dIhLa1gUL4RcnOoQGv4hu

-- Dumped from database version 17.7
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO postgres;

--
-- Name: inventory; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA inventory;


ALTER SCHEMA inventory OWNER TO postgres;

--
-- Name: operations; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA operations;


ALTER SCHEMA operations OWNER TO postgres;

--
-- Name: update_modified_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_modified_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_modified_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.users (
    id integer NOT NULL,
    full_name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    phone character varying(20),
    role character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['client'::character varying, 'employee'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE auth.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: auth; Owner: postgres
--

CREATE SEQUENCE auth.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: postgres
--

ALTER SEQUENCE auth.users_id_seq OWNED BY auth.users.id;


--
-- Name: products; Type: TABLE; Schema: inventory; Owner: postgres
--

CREATE TABLE inventory.products (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    brand character varying(50),
    category character varying(50),
    price numeric(10,2) NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    min_stock integer DEFAULT 5 NOT NULL,
    image_url text,
    is_active boolean DEFAULT true,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE inventory.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: inventory; Owner: postgres
--

CREATE SEQUENCE inventory.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE inventory.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: inventory; Owner: postgres
--

ALTER SEQUENCE inventory.products_id_seq OWNED BY inventory.products.id;


--
-- Name: appointments; Type: TABLE; Schema: operations; Owner: postgres
--

CREATE TABLE operations.appointments (
    id integer NOT NULL,
    client_id integer,
    stylist_id integer,
    service_id integer,
    appointment_date timestamp without time zone NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    total_amount numeric(10,2) NOT NULL,
    deposit_amount numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT appointments_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'confirmed'::character varying, 'completed'::character varying, 'canceled'::character varying, 'no_show'::character varying])::text[])))
);


ALTER TABLE operations.appointments OWNER TO postgres;

--
-- Name: appointments_id_seq; Type: SEQUENCE; Schema: operations; Owner: postgres
--

CREATE SEQUENCE operations.appointments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE operations.appointments_id_seq OWNER TO postgres;

--
-- Name: appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: operations; Owner: postgres
--

ALTER SEQUENCE operations.appointments_id_seq OWNED BY operations.appointments.id;


--
-- Name: services; Type: TABLE; Schema: operations; Owner: postgres
--

CREATE TABLE operations.services (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    duration_minutes integer NOT NULL,
    image_url text,
    is_active boolean DEFAULT true
);


ALTER TABLE operations.services OWNER TO postgres;

--
-- Name: services_id_seq; Type: SEQUENCE; Schema: operations; Owner: postgres
--

CREATE SEQUENCE operations.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE operations.services_id_seq OWNER TO postgres;

--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: operations; Owner: postgres
--

ALTER SEQUENCE operations.services_id_seq OWNED BY operations.services.id;


--
-- Name: inventory_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_logs (
    id integer NOT NULL,
    product_id integer,
    user_id integer,
    quantity_change integer NOT NULL,
    reason character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.inventory_logs OWNER TO postgres;

--
-- Name: inventory_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inventory_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_logs_id_seq OWNER TO postgres;

--
-- Name: inventory_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inventory_logs_id_seq OWNED BY public.inventory_logs.id;


--
-- Name: order_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_details (
    id integer NOT NULL,
    order_id integer,
    product_id integer,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL
);


ALTER TABLE public.order_details OWNER TO postgres;

--
-- Name: order_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_details_id_seq OWNER TO postgres;

--
-- Name: order_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_details_id_seq OWNED BY public.order_details.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    client_id integer,
    total numeric(10,2) NOT NULL,
    payment_method character varying(50) NOT NULL,
    delivery_method character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'completed'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_online_sale boolean DEFAULT false
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: system_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_logs (
    id integer NOT NULL,
    user_id integer,
    action character varying(50) NOT NULL,
    module character varying(50) NOT NULL,
    details text,
    ip_address character varying(45),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.system_logs OWNER TO postgres;

--
-- Name: system_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.system_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.system_logs_id_seq OWNER TO postgres;

--
-- Name: system_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.system_logs_id_seq OWNED BY public.system_logs.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    type character varying(10) NOT NULL,
    amount numeric(10,2) NOT NULL,
    category character varying(50) NOT NULL,
    description text,
    reference_id integer,
    transaction_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT transactions_type_check CHECK (((type)::text = ANY ((ARRAY['income'::character varying, 'expense'::character varying])::text[])))
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transactions_id_seq OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: users id; Type: DEFAULT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.users ALTER COLUMN id SET DEFAULT nextval('auth.users_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: inventory; Owner: postgres
--

ALTER TABLE ONLY inventory.products ALTER COLUMN id SET DEFAULT nextval('inventory.products_id_seq'::regclass);


--
-- Name: appointments id; Type: DEFAULT; Schema: operations; Owner: postgres
--

ALTER TABLE ONLY operations.appointments ALTER COLUMN id SET DEFAULT nextval('operations.appointments_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: operations; Owner: postgres
--

ALTER TABLE ONLY operations.services ALTER COLUMN id SET DEFAULT nextval('operations.services_id_seq'::regclass);


--
-- Name: inventory_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_logs ALTER COLUMN id SET DEFAULT nextval('public.inventory_logs_id_seq'::regclass);


--
-- Name: order_details id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_details ALTER COLUMN id SET DEFAULT nextval('public.order_details_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: system_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs ALTER COLUMN id SET DEFAULT nextval('public.system_logs_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: postgres
--

COPY auth.users (id, full_name, email, password_hash, phone, role, created_at, is_active, updated_at) FROM stdin;
1	Ezequiel Castillo	admin@estetica.com	$2b$10$PBkoKZheMOlD3H/TW/tS/OfqH4Fwvbzx8igsXxErmdEFzMfGw7/KG	7712028110	admin	2026-02-19 01:52:41.211638	t	2026-03-08 21:17:23.787464
5	Javier Flores Hernandez	20230069@uthh.edu.mx	$2b$10$zER9Ieg4Vh8utUqY/38.yuhofGbZtgbZHeXkvCnje63s.Sj2sMeQ.	7712426663	admin	2026-02-28 23:04:11.476	t	2026-03-08 21:17:23.787464
6	javier	floressssjavi@gmail.com	$2b$10$4gLhHahwZG22WW3c7n6QcuET39D9FnFPgJvp8mWeV9lgFVLGVUgiO	7712426663	client	2026-03-02 01:24:21.669212	t	2026-03-08 21:17:23.787464
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: inventory; Owner: postgres
--

COPY inventory.products (id, name, brand, category, price, stock, min_stock, image_url, is_active, updated_at) FROM stdin;
286	Bálsamo Crecimiento Barba	Minoxidil 5%	Cuidado de Barba	450.00	30	5	\N	t	2026-03-13 01:26:52.910963
285	Shampoo para Barba	Mel Bros	Cuidado de Barba	280.00	20	5	\N	t	2026-03-13 01:26:52.911769
284	Cera para Bigote	Captain Fawcett	Cuidado de Barba	320.00	10	5	\N	t	2026-03-13 01:26:52.912493
283	Loción Aftershave	Pinaud Clubman	Cuidado de Barba	210.00	25	5	\N	t	2026-03-13 01:26:52.913207
282	Tónico Refrescante Barba	Reuzel	Cuidado de Barba	390.00	12	5	\N	t	2026-03-13 01:26:52.913922
281	Jabón de Afeitar Tradicional	Proraso	Cuidado de Barba	190.00	18	5	\N	t	2026-03-13 01:26:52.914673
280	Bálsamo Hidratante	Grave Before Shave	Cuidado de Barba	410.00	14	5	\N	t	2026-03-13 01:26:52.915774
279	Aceite Esencial Cítrico	Barba Norteña	Cuidado de Barba	220.00	35	5	\N	t	2026-03-13 01:26:52.916778
278	Aftershave en Gel	Elegance	Cuidado de Barba	160.00	40	5	\N	t	2026-03-13 01:26:52.917986
277	Navaja Libre de Acero	Parker	Herramientas	450.00	10	5	\N	t	2026-03-13 01:26:52.918804
276	Tijeras de Corte 6 pulgadas	Jaguar	Herramientas	1200.00	5	5	\N	t	2026-03-13 01:26:52.919772
275	Tijeras de Entresacar	Jaguar	Herramientas	1300.00	4	5	\N	t	2026-03-13 01:26:52.920399
274	Máquina Cortadora Magic Clip	Wahl	Herramientas	2500.00	8	5	\N	t	2026-03-13 01:26:52.921117
273	Terminadora Detailer	Wahl	Herramientas	1800.00	6	5	\N	t	2026-03-13 01:26:52.922034
272	Cepillo Fade de Cerdas	Andis	Herramientas	150.00	30	5	\N	t	2026-03-13 01:26:52.923213
271	Peine de Carbono	Termix	Herramientas	85.00	50	5	\N	t	2026-03-13 01:26:52.924058
270	Brocha Sacudidora	Genérico	Herramientas	120.00	25	5	\N	t	2026-03-13 01:26:52.925211
269	Capa de Corte Barbería	Genérico	Herramientas	180.00	40	5	\N	t	2026-03-13 01:26:52.926087
268	Atomizador de Agua Continuo	Genérico	Herramientas	110.00	35	5	\N	t	2026-03-13 01:26:52.928534
267	Ampolleta Anticaída	Alfaparf	Tratamientos Especiales	85.00	100	5	\N	t	2026-03-13 01:26:52.929934
266	Ampolleta Hidratación Profunda	Salerm	Tratamientos Especiales	75.00	80	5	\N	t	2026-03-13 01:26:52.93118
265	Tónico Capilar Mentolado	Osage Rub	Tratamientos Especiales	260.00	20	5	\N	t	2026-03-13 01:26:52.932779
264	Tratamiento de Keratina	Kativa	Tratamientos Especiales	350.00	15	5	\N	t	2026-03-13 01:26:52.933944
263	Mascarilla de Carbón Activado	Pilaten	Tratamientos Especiales	15.00	200	5	\N	t	2026-03-13 01:26:52.936591
262	Exfoliante Facial	Nivea Men	Otros	140.00	25	5	\N	t	2026-03-13 01:26:52.937912
261	Gel Limpiador Facial	Loreal Men	Otros	160.00	30	5	\N	t	2026-03-13 01:26:52.938791
260	Talco para Barbero	Pinaud Clubman	Otros	190.00	20	5	\N	t	2026-03-13 01:26:52.939828
259	Papel Cuellero (Rollo)	Genérico	Otros	45.00	150	5	\N	t	2026-03-13 01:26:52.940694
258	Toallas Desechables (Paquete)	Genérico	Otros	220.00	40	5	\N	t	2026-03-13 01:26:52.941715
307	Shampoo Limpieza Profunda	Suavecito	Cuidado Capilar	250.00	15	5	\N	t	2026-03-13 01:26:52.868689
306	Acondicionador Hidratante	Suavecito	Cuidado Capilar	260.00	20	5	\N	t	2026-03-13 01:26:52.882463
305	Shampoo Matizador	Loreal	Cuidado Capilar	320.00	10	5	\N	t	2026-03-13 01:26:52.89072
304	Shampoo Anticaspa	Head & Shoulders	Cuidado Capilar	110.00	30	5	\N	t	2026-03-13 01:26:52.891673
303	Acondicionador Reparación	Pantene	Cuidado Capilar	95.00	25	5	\N	t	2026-03-13 01:26:52.892489
302	Mascarilla Capilar Intensiva	Kerastase	Cuidado Capilar	850.00	5	5	\N	t	2026-03-13 01:26:52.893807
301	Shampoo Crecimiento	Tío Nacho	Cuidado Capilar	150.00	40	5	\N	t	2026-03-13 01:26:52.89519
300	Acondicionador Rizos	Cantú	Cuidado Capilar	210.00	12	5	\N	t	2026-03-13 01:26:52.895946
299	Shampoo Sólido	EcoHair	Cuidado Capilar	180.00	18	5	\N	t	2026-03-13 01:26:52.897288
298	Tratamiento Sin Enjuague	Olaplex	Cuidado Capilar	650.00	8	5	\N	t	2026-03-13 01:26:52.898536
297	Pomada Firme Original	Suavecito	Fijación y Peinado	300.00	50	5	\N	t	2026-03-13 01:26:52.899547
296	Pomada Mate Firme	Suavecito	Fijación y Peinado	320.00	45	5	\N	t	2026-03-13 01:26:52.900601
295	Cera Efecto Telaraña	Nishman	Fijación y Peinado	180.00	30	5	\N	t	2026-03-13 01:26:52.901738
294	Gel Fijación Extrema	Elegance	Fijación y Peinado	150.00	60	5	\N	t	2026-03-13 01:26:52.90313
293	Cera Moldeadora	American Crew	Fijación y Peinado	450.00	15	5	\N	t	2026-03-13 01:26:52.904001
292	Spray Fijador Fuerte	Silhouette	Fijación y Peinado	220.00	25	5	\N	t	2026-03-13 01:26:52.905241
291	Polvo Texturizador	Osis+	Fijación y Peinado	380.00	20	5	\N	t	2026-03-13 01:26:52.90712
290	Arcilla Texturizante	Reuzel	Fijación y Peinado	410.00	12	5	\N	t	2026-03-13 01:26:52.907916
289	Gel Base Agua	Moco de Gorila	Fijación y Peinado	65.00	100	5	\N	t	2026-03-13 01:26:52.908688
288	Crema para Peinar	Sedal	Fijación y Peinado	55.00	80	5	\N	t	2026-03-13 01:26:52.909489
287	Aceite para Barba Premium	Proraso	Cuidado de Barba	350.00	15	5	\N	t	2026-03-13 01:26:52.910226
\.


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: operations; Owner: postgres
--

COPY operations.appointments (id, client_id, stylist_id, service_id, appointment_date, status, total_amount, deposit_amount, created_at, updated_at) FROM stdin;
4	5	\N	2	2026-03-14 11:00:00	confirmed	250.00	0.00	2026-03-04 23:49:43.808051	2026-03-08 21:17:23.787464
3	5	\N	2	2026-03-13 10:00:00	confirmed	250.00	0.00	2026-03-04 23:49:09.888486	2026-03-08 21:17:23.787464
5	5	\N	3	2026-03-12 11:00:00	confirmed	500.00	0.00	2026-03-05 01:14:14.582028	2026-03-08 21:17:23.787464
6	6	\N	3	2026-03-26 11:00:00	confirmed	500.00	0.00	2026-03-16 20:55:23.346659	2026-03-16 20:56:09.414032
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: operations; Owner: postgres
--

COPY operations.services (id, name, description, price, duration_minutes, image_url, is_active) FROM stdin;
2	Cortes de Pelo	Inlcuye masaje facial con arreglo de barba	250.00	60	/uploads/1771615156412-459263884.jpg	t
3	Pintado de pel	puedes pedir cualquier colo	500.00	90	/uploads/1771615267709-636381801.jpeg	t
\.


--
-- Data for Name: inventory_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_logs (id, product_id, user_id, quantity_change, reason, created_at) FROM stdin;
\.


--
-- Data for Name: order_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_details (id, order_id, product_id, quantity, unit_price) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, client_id, total, payment_method, delivery_method, status, created_at, is_online_sale) FROM stdin;
\.


--
-- Data for Name: system_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_logs (id, user_id, action, module, details, ip_address, created_at) FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, type, amount, category, description, reference_id, transaction_date) FROM stdin;
\.


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: postgres
--

SELECT pg_catalog.setval('auth.users_id_seq', 6, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: inventory; Owner: postgres
--

SELECT pg_catalog.setval('inventory.products_id_seq', 307, true);


--
-- Name: appointments_id_seq; Type: SEQUENCE SET; Schema: operations; Owner: postgres
--

SELECT pg_catalog.setval('operations.appointments_id_seq', 6, true);


--
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: operations; Owner: postgres
--

SELECT pg_catalog.setval('operations.services_id_seq', 4, true);


--
-- Name: inventory_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventory_logs_id_seq', 1, false);


--
-- Name: order_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_details_id_seq', 1, false);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, false);


--
-- Name: system_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.system_logs_id_seq', 1, false);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transactions_id_seq', 1, false);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: inventory; Owner: postgres
--

ALTER TABLE ONLY inventory.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: operations; Owner: postgres
--

ALTER TABLE ONLY operations.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: operations; Owner: postgres
--

ALTER TABLE ONLY operations.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: inventory_logs inventory_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_logs
    ADD CONSTRAINT inventory_logs_pkey PRIMARY KEY (id);


--
-- Name: order_details order_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_details
    ADD CONSTRAINT order_details_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: system_logs system_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: idx_users_email; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX idx_users_email ON auth.users USING btree (email);


--
-- Name: idx_products_brand; Type: INDEX; Schema: inventory; Owner: postgres
--

CREATE INDEX idx_products_brand ON inventory.products USING btree (brand);


--
-- Name: idx_products_category; Type: INDEX; Schema: inventory; Owner: postgres
--

CREATE INDEX idx_products_category ON inventory.products USING btree (category);


--
-- Name: idx_products_name; Type: INDEX; Schema: inventory; Owner: postgres
--

CREATE INDEX idx_products_name ON inventory.products USING btree (name);


--
-- Name: idx_appointments_client; Type: INDEX; Schema: operations; Owner: postgres
--

CREATE INDEX idx_appointments_client ON operations.appointments USING btree (client_id);


--
-- Name: idx_appointments_service; Type: INDEX; Schema: operations; Owner: postgres
--

CREATE INDEX idx_appointments_service ON operations.appointments USING btree (service_id);


--
-- Name: idx_appointments_status; Type: INDEX; Schema: operations; Owner: postgres
--

CREATE INDEX idx_appointments_status ON operations.appointments USING btree (status);


--
-- Name: users trigger_update_users; Type: TRIGGER; Schema: auth; Owner: postgres
--

CREATE TRIGGER trigger_update_users BEFORE UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


--
-- Name: products trigger_update_products; Type: TRIGGER; Schema: inventory; Owner: postgres
--

CREATE TRIGGER trigger_update_products BEFORE UPDATE ON inventory.products FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


--
-- Name: appointments trigger_update_appointments; Type: TRIGGER; Schema: operations; Owner: postgres
--

CREATE TRIGGER trigger_update_appointments BEFORE UPDATE ON operations.appointments FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


--
-- Name: appointments appointments_client_id_fkey; Type: FK CONSTRAINT; Schema: operations; Owner: postgres
--

ALTER TABLE ONLY operations.appointments
    ADD CONSTRAINT appointments_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.users(id);


--
-- Name: appointments appointments_service_id_fkey; Type: FK CONSTRAINT; Schema: operations; Owner: postgres
--

ALTER TABLE ONLY operations.appointments
    ADD CONSTRAINT appointments_service_id_fkey FOREIGN KEY (service_id) REFERENCES operations.services(id);


--
-- Name: appointments appointments_stylist_id_fkey; Type: FK CONSTRAINT; Schema: operations; Owner: postgres
--

ALTER TABLE ONLY operations.appointments
    ADD CONSTRAINT appointments_stylist_id_fkey FOREIGN KEY (stylist_id) REFERENCES auth.users(id);


--
-- Name: inventory_logs inventory_logs_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_logs
    ADD CONSTRAINT inventory_logs_product_id_fkey FOREIGN KEY (product_id) REFERENCES inventory.products(id);


--
-- Name: inventory_logs inventory_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_logs
    ADD CONSTRAINT inventory_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: order_details order_details_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_details
    ADD CONSTRAINT order_details_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: order_details order_details_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_details
    ADD CONSTRAINT order_details_product_id_fkey FOREIGN KEY (product_id) REFERENCES inventory.products(id);


--
-- Name: orders orders_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.users(id);


--
-- Name: system_logs system_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA auth TO api_backend;
GRANT USAGE ON SCHEMA auth TO data_analyst;


--
-- Name: SCHEMA inventory; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA inventory TO api_backend;
GRANT USAGE ON SCHEMA inventory TO data_analyst;


--
-- Name: SCHEMA operations; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA operations TO api_backend;
GRANT USAGE ON SCHEMA operations TO data_analyst;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE auth.users TO api_backend;
GRANT SELECT ON TABLE auth.users TO data_analyst;


--
-- Name: SEQUENCE users_id_seq; Type: ACL; Schema: auth; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE auth.users_id_seq TO api_backend;


--
-- Name: TABLE products; Type: ACL; Schema: inventory; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE inventory.products TO api_backend;
GRANT SELECT ON TABLE inventory.products TO data_analyst;


--
-- Name: SEQUENCE products_id_seq; Type: ACL; Schema: inventory; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE inventory.products_id_seq TO api_backend;


--
-- Name: TABLE appointments; Type: ACL; Schema: operations; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE operations.appointments TO api_backend;
GRANT SELECT ON TABLE operations.appointments TO data_analyst;


--
-- Name: SEQUENCE appointments_id_seq; Type: ACL; Schema: operations; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE operations.appointments_id_seq TO api_backend;


--
-- Name: TABLE services; Type: ACL; Schema: operations; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE operations.services TO api_backend;
GRANT SELECT ON TABLE operations.services TO data_analyst;


--
-- Name: SEQUENCE services_id_seq; Type: ACL; Schema: operations; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE operations.services_id_seq TO api_backend;


--
-- PostgreSQL database dump complete
--

\unrestrict 1gY3rlmXMXtYlsxc5za6gKXoAmsB7pFf0HrNRHfds7dIhLa1gUL4RcnOoQGv4hu

