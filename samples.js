const axios = require("axios");
const querystring = require("querystring");

const aadTenant = "https://login.microsoftonline.com/";

const aadTenantId = "90164726-383b-4f08-868f-5f362e1a7d88";

const appId = "8c432dca-70d1-45b6-bf25-11facf862aa7";

const appSecret = "Sz48Q~6m_rtZN6cwsbru9m58wF.24bRQ0ZJ1sa_q";

const fhirEndpoint =
  "https://samplefhirvida-fhirservice.fhir.azurehealthcareapis.com/";

function getHttpHeader(accessToken) {
  return {
    Authorization: "Bearer " + accessToken,
    "Content-type": "application/json",
  };
}

function printResourceData(resource) {
  const resourceType = resource["resourceType"];
  const itemId = resource["id"];
  if (resourceType === "OperationOutcome") {
    console.log("\t" + resource);
  } else {
    const itemId = resource["id"];
    console.log("\t" + resourceType + "/" + itemId);
  }
}

function printResponseResults(response) {
  const responseAsJson = response.data;

  if (!responseAsJson.entry) {
    // Print the resource type and id of a resource.
    printResourceData(responseAsJson);
  } else {
    // Prints the resource type and ids of all resources under a bundle.
    for (const item of responseAsJson.entry) {
      const resource = item.resource;
      printResourceData(resource);
    }
  }
}

///////////////////////////////////////////////////////////

async function getAuthToken() {
  try {
    const data = querystring.stringify({
      client_id: appId,
      client_secret: appSecret,
      grant_type: "client_credentials",
      resource: fhirEndpoint,
    });

    const response = await axios.post(
      aadTenant + aadTenantId + "/oauth2/token",
      data,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = response.data.access_token;
    console.log(
      "\tAAD Access Token acquired: " + accessToken.substring(0, 50) + "..."
    );
    return accessToken;
  } catch (error) {
    console.log("\tError getting token: " + error);
    return null;
  }
}

async function postPatient(accessToken, data) {
  // Example of FHIR Patient: https://www.hl7.org/fhir/patient-example.json.html

  const patientData = {
    resourceType: "Patient",
    text: {
      status: "generated",
      div: '<div xmlns="http://www.w3.org/1999/xhtml"><p style="border: 1px #661aff solid; background-color: #e6e6ff; padding: 10px;"><b>Jim </b> male, DoB: 1974-12-25 ( Medical record number: 12345\u00a0(use:\u00a0USUAL,\u00a0period:\u00a02001-05-06 --&gt; (ongoing)))</p><hr/><table class="grid"><tr><td style="background-color: #f3f5da" title="Record is active">Active:</td><td>true</td><td style="background-color: #f3f5da" title="Known status of Patient">Deceased:</td><td colspan="3">false</td></tr><tr><td style="background-color: #f3f5da" title="Alternate names (see the one above)">Alt Names:</td><td colspan="3"><ul><li>Peter James Chalmers (OFFICIAL)</li><li>Peter James Windsor (MAIDEN)</li></ul></td></tr><tr><td style="background-color: #f3f5da" title="Ways to contact the Patient">Contact Details:</td><td colspan="3"><ul><li>-unknown-(HOME)</li><li>ph: (03) 5555 6473(WORK)</li><li>ph: (03) 3410 5613(MOBILE)</li><li>ph: (03) 5555 8834(OLD)</li><li>534 Erewhon St PeasantVille, Rainbow, Vic  3999(HOME)</li></ul></td></tr><tr><td style="background-color: #f3f5da" title="Nominated Contact: Next-of-Kin">Next-of-Kin:</td><td colspan="3"><ul><li>Bénédicte du Marché  (female)</li><li>534 Erewhon St PleasantVille Vic 3999 (HOME)</li><li><a href="tel:+33(237)998327">+33 (237) 998327</a></li><li>Valid Period: 2012 --&gt; (ongoing)</li></ul></td></tr><tr><td style="background-color: #f3f5da" title="Patient Links">Links:</td><td colspan="3"><ul><li>Managing Organization: <a href="organization-example-gastro.html">Organization/1</a> &quot;Gastroenterology&quot;</li></ul></td></tr></table></div>',
    },
    identifier: [
      {
        use: "usual",
        type: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v2-0203",
              code: "MR",
            },
          ],
        },
        system: "urn:oid:1.2.36.146.595.217.0.1",
        value: "12345",
        period: {
          start: "2001-05-06",
        },
        assigner: {
          display: "Acme Healthcare",
        },
      },
    ],
    active: true,
    name: [
      {
        use: "official",
        family: "Chalmers",
        given: ["Peter", "James"],
      },
      {
        use: "usual",
        given: ["Jim"],
      },
      {
        use: "maiden",
        family: "Windsor",
        given: ["Peter", "James"],
        period: {
          end: "2002",
        },
      },
    ],
    telecom: [
      {
        use: "home",
      },
      {
        system: "phone",
        value: "(03) 5555 6473",
        use: "work",
        rank: 1,
      },
      {
        system: "phone",
        value: "(03) 3410 5613",
        use: "mobile",
        rank: 2,
      },
      {
        system: "phone",
        value: "(03) 5555 8834",
        use: "old",
        period: {
          end: "2014",
        },
      },
    ],
    gender: "male",
    birthDate: "1974-12-25",
    _birthDate: {
      extension: [
        {
          url: "http://hl7.org/fhir/StructureDefinition/patient-birthTime",
          valueDateTime: "1974-12-25T14:35:45-05:00",
        },
      ],
    },
    deceasedBoolean: false,
    address: [
      {
        use: "home",
        type: "both",
        text: "534 Erewhon St PeasantVille, Rainbow, Vic  3999",
        line: ["534 Erewhon St"],
        city: "PleasantVille",
        district: "Rainbow",
        state: "Vic",
        postalCode: "3999",
        period: {
          start: "1974-12-25",
        },
      },
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/v2-0131",
                code: "N",
              },
            ],
          },
        ],
        name: {
          family: "du Marché",
          _family: {
            extension: [
              {
                url: "http://hl7.org/fhir/StructureDefinition/humanname-own-prefix",
                valueString: "VV",
              },
            ],
          },
          given: ["Bénédicte"],
        },
        telecom: [
          {
            system: "phone",
            value: "+33 (237) 998327",
          },
        ],
        address: {
          use: "home",
          type: "both",
          line: ["534 Erewhon St"],
          city: "PleasantVille",
          district: "Rainbow",
          state: "Vic",
          postalCode: "3999",
          period: {
            start: "1974-12-25",
          },
        },
        gender: "female",
        period: {
          start: "2012",
        },
      },
    ],
    managingOrganization: {
      reference: "Organization/1",
    },
  };

  try {
    const response = await axios.post(
      fhirEndpoint + "Patient",
      data || patientData,
      {
        headers: getHttpHeader(accessToken),
      }
    );
    const resourceId = response.data.id;
    console.log(
      "\tPatient ingested: " + resourceId + ". HTTP " + response.status
    );
    return resourceId;
  } catch (error) {
    console.log("\tError persisting patient: " + error);
    return null;
  }
}

async function postPerson(accessToken, data) {
  // Example of FHIR Patient: https://www.hl7.org/fhir/patient-example.json.html

  const personData = {
    resourceType: "Person",
    id: "example",
    text: {
      status: "generated",
      div: '<div xmlns="http://www.w3.org/1999/xhtml">\n      <table>\n        <tbody>\n          <tr>\n            <td>Name</td>\n            <td>Peter James <b>Chalmers</b> (&quot;Jim&quot;)</td>\n          </tr>\n          <tr>\n            <td>Address</td>\n            <td>534 Erewhon, Pleasantville, Vic, 3999</td>\n          </tr>\n          <tr>\n            <td>Contacts</td>\n            <td>Home: unknown. Work: (03) 5555 6473</td>\n          </tr>\n          <tr>\n            <td>Id</td>\n            <td>MRN: 12345 (Acme Healthcare)</td>\n          </tr>\n        </tbody>\n      </table>\n    </div>',
    },
    identifier: [
      {
        use: "usual",
        type: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v2-0203",
              code: "MR",
            },
          ],
        },
        system: "urn:oid:1.2.36.146.595.217.0.1",
        value: "12345",
        period: {
          start: "2001-05-06",
        },
        assigner: {
          display: "Acme Healthcare",
        },
      },
    ],
    active: true,
    name: [
      {
        use: "official",
        family: "Chalmers",
        given: ["Peter", "James"],
      },
      {
        use: "usual",
        given: ["Jim"],
      },
    ],
    telecom: [
      {
        use: "home",
      },
      {
        system: "phone",
        value: "(03) 5555 6473",
        use: "work",
      },
      {
        system: "email",
        value: "Jim@example.org",
        use: "home",
      },
    ],
    gender: "male",
    birthDate: "1974-12-25",
    address: [
      {
        use: "home",
        line: ["534 Erewhon St"],
        city: "PleasantVille",
        state: "Vic",
        postalCode: "3999",
      },
    ],
    link: [
      {
        target: {
          reference: "RelatedPerson/peter",
          display: "Peter Chalmers",
        },
      },
      {
        target: {
          reference: "Patient/example",
          display: "Peter Chalmers",
        },
      },
    ],
  };

  try {
    const response = await axios.post(
      fhirEndpoint + "Person", personData,
      {
        headers: getHttpHeader(accessToken),
      }
    );
    const resourceId = response.data.id;
    console.log(
      "\tPerson ingested: " + resourceId + ". HTTP " + response.status
    );
    return resourceId;
  } catch (error) {
    console.log("\tError persisting person: " + error);
    return null;
  }
}

async function postPractitioner(accessToken) {
  // Example of FHIR Practitioner: https://www.hl7.org/fhir/practitioner-example.json.html

  const practitionerData = {
    resourceType: "Practitioner",
    active: true,
    name: [
      {
        family: "Smith",
        given: ["John"],
      },
    ],
    gender: "male",
    birthDate: "1975-05-15",
    address: [
      {
        use: "home",
        line: ["123 Main Street"],
        city: "Anytown",
        state: "CA",
        postalCode: "12345",
      },
    ],
    telecom: [
      {
        system: "phone",
        value: "555-555-5555",
      },
      {
        system: "email",
        value: "john.smith@example.com",
      },
    ],
    qualification: [
      {
        code: {
          coding: [
            {
              system: "http://www.nlm.nih.gov/research/umls/rxnorm",
              code: "Physician",
            },
          ],
          text: "Physician",
        },
        period: {
          start: "2000-01-01",
        },
      },
    ],
  };

  try {
    const response = await axios.post(
      fhirEndpoint + "Practitioner",
      practitionerData,
      { headers: getHttpHeader(accessToken) }
    );
    const resourceId = response.data.id;
    console.log(
      "\tPractitioner ingested: " + resourceId + ". HTTP " + response.status
    );
    return resourceId;
  } catch (error) {
    console.log("\tError persisting practitioner: " + error.response.status);
    return null;
  }
}

async function postAppointment(patientId, practitionerId, accessToken) {
  // https://hl7.org/fhir/R4/appointment-example.json.html

  const appointmentData = {
    resourceType: "Appointment",
    status: "booked",
    description: "Follow-up appointment with Dr. Smith",
    start: "2023-12-30T10:00:00-04:00",
    end: "2023-12-30T11:00:00-04:00",
    participant: [
      {
        actor: {
          reference: "Practitioner/" + practitionerId,
        },
        status: "accepted",
        type: [
          {
            coding: [
              {
                system:
                  "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
                code: "ATND",
              },
            ],
            text: "Attendee",
          },
        ],
      },
      {
        actor: {
          reference: "Patient/" + patientId,
        },
        status: "accepted",
        type: [
          {
            coding: [
              {
                system:
                  "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
                code: "PAT",
              },
            ],
            text: "Patient",
          },
        ],
      },
    ],
  };

  try {
    const response = await axios.post(
      fhirEndpoint + "Appointment",
      appointmentData,
      { headers: getHttpHeader(accessToken) }
    );
    const resourceId = response.data.id;
    console.log(
      "\tAppointment ingested: " + resourceId + ". HTTP " + response.status
    );
    return resourceId;
  } catch (error) {
    console.log("\tError persisting appointment: " + error.response?.status);
    return null;
  }
}

async function printPatientInfo(patientId, accessToken) {
  // GET htts://<fhir endpoint>/Patient/<patientId>

  const baseUrl = fhirEndpoint + "Patient/" + patientId;

  try {
    const response = await axios.get(baseUrl, {
      headers: getHttpHeader(accessToken),
    });
    printResponseResults(response);

    return response?.data;
  } catch (error) {
    console.log("\tError getting patient data: " + error.response.status);
  }
}

async function getPatients(accessToken) {
  const baseUrl = fhirEndpoint + "Patient" + "?_count=100";

  try {
    const response = await axios.get(baseUrl, {
      headers: getHttpHeader(accessToken),
    });

    return response?.data;
  } catch (error) {
    console.log("\tError getting patient data: " + error.response.status);
  }
}

async function getPerson(accessToken) {
  const baseUrl = fhirEndpoint + "Person" + "?_count=100";

  try {
    const response = await axios.get(baseUrl, {
      headers: getHttpHeader(accessToken),
    });

    return response?.data;
  } catch (error) {
    console.log("\tError getting person data: " + error.response.status);
  }
}

async function getPractitioners(accessToken) {
  const baseUrl = fhirEndpoint + "Practitioner";

  try {
    const response = await axios.get(baseUrl, {
      headers: getHttpHeader(accessToken),
    });

    return response?.data;
  } catch (error) {
    console.log("\tError getting patient data: " + error.response.status);
  }
}

async function printAllAppointmentsAssignedToPatient(patientId, accessToken) {
  // GET htts://<fhir endpoint>/Appointment?actor=Patient/<patientId>

  const baseUrl = fhirEndpoint + "Appointment";
  const queryParams = { actor: "Patient/" + patientId };

  try {
    const response = await axios.get(baseUrl, {
      params: queryParams,
      headers: getHttpHeader(accessToken),
    });
    return response?.data;
  } catch (error) {
    console.log("\tError getting appointments: " + error.response.status);
  }
}

///////////////////////////////////////////////////////////

const seed = async () => {
  // Step 2 - Acquire authentication token
  console.log("Acquire authentication token for secure communication.");
  const accessToken = await getAuthToken();
  if (!accessToken) {
    process.exit(1);
  }

  // Step 3 - Insert Patient
  console.log("Persist Patient data.");
  const patientId = await postPatient(accessToken);
  if (!patientId) {
    process.exit(1);
  }

  // Step 4 - Insert Practitioner (Doctor)
  console.log("Persist Practitioner data.");
  const practitionerId = await postPractitioner(accessToken);
  if (!practitionerId) {
    process.exit(1);
  }

  // Step 5 - Insert Appointments
  console.log(
    "Insert multiple appointments using Patient and Practitioner IDs."
  );
  const appointmentId1 = await postAppointment(
    patientId,
    practitionerId,
    accessToken
  );
  if (!appointmentId1) {
    process.exit(1);
  }

  const appointmentId2 = await postAppointment(
    patientId,
    practitionerId,
    accessToken
  );
  if (!appointmentId2) {
    process.exit(1);
  }

  const appointmentId3 = await postAppointment(
    patientId,
    practitionerId,
    accessToken
  );
  if (!appointmentId3) {
    process.exit(1);
  }

  // Step 6 - Print Patient info
  console.log("Query Patient's data.");
  printPatientInfo(patientId, accessToken);

  // Step 7 - Print all appointments assigned to a Patient
  console.log("Query all Appointments assigned to a Patient.");
  printAllAppointmentsAssignedToPatient(patientId, accessToken);
};

// Para popular os dados, descomente abaixo e execute
// apenas uma vez
// seed();

module.exports = {
  printPatientInfo,
  postPatient,
  postPerson,
  printAllAppointmentsAssignedToPatient,
  getAuthToken,
  getPatients,
  getPerson,
  getPractitioners,
  postPractitioner,
  postAppointment,
};
