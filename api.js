const express = require('express');
const cors = require('cors');
const {
  getAuthToken,
  postPatient,
  printPatientInfo,
  getPatients,
  getPractitioners,
  postPractitioner,
  postAppointment,
  printAllAppointmentsAssignedToPatient
} = require('./samples');

const app = express();
const port = 3000 || process.env.PORT; // Porta em que o servidor irá escutar

// Habilitar o middleware CORS para permitir solicitações de qualquer origem
app.use(cors());

// Habilita a possibilidade de mandar "req.body" nas APIs
app.use(express.json());

// Rota de exemplo
app.get('/patients', async (req, res) => {
  const accessToken = await getAuthToken();
  const data = await getPatients(accessToken);

  res.json(data?.entry || []);
});

app.get('/practitioners', async (req, res) => {
  const accessToken = await getAuthToken();
  const data = await getPractitioners(accessToken);

  res.json(data?.entry || []);
});

app.get('/appointments', async (req, res) => {
  const accessToken = await getAuthToken();
  const data = await getPractitioners(accessToken);

  res.json(data?.entry || []);
});

app.get('/patient-appointments/:id', async (req, res) => {
  const patientId = req.params.id;
  const accessToken = await getAuthToken();
  const data = await printAllAppointmentsAssignedToPatient(patientId, accessToken);

  res.json(data);
});

app.get('/patients/:id', async (req, res) => {
  const patientId = req.params.id;
  const accessToken = await getAuthToken();
  const data = await printPatientInfo(patientId, accessToken);

  res.json(data);
});

app.post('/patients', async (req, res) => {
  const accessToken = await getAuthToken();
  const patientId = await postPatient(accessToken, req.body);

  res.json({ patientId });
});

app.post('/practitioners', async (req, res) => {
  const accessToken = await getAuthToken();
  const patientId = await postPractitioner(accessToken);

  res.json({ patientId });
});

app.post('/appointment', async (req, res) => {
  const accessToken = await getAuthToken();
  const patientId = await postAppointment(accessToken);

  res.json({ patientId });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor Express rodando na porta ${port}`);
});