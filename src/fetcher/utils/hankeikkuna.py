from datetime import datetime

def process_hankeikkuna_data(data):
    """Poimi sivullisesta hankeikkuna-dataa lausuntokierroksen lausunnot, valmistelutunnukset ja he-tunnukset"""
    submission_data = []
    size = data["size"]
    for i in range(size):
        preparatory_identifier = find_preparatory_identifier(data, i)
        proposal_identifier = find_proposal_identifier(data, i)
        documents = find_documents(data, i)
        submissions = find_submissions(documents)
        if not preparatory_identifier or not proposal_identifier or not submissions:
            continue
        project_submissions = {
            "preparatoryIdentifier": preparatory_identifier,
            "proposalIdentifier": proposal_identifier,
            "submissions": submissions,
        }
        submission_data.append(project_submissions)
    return submission_data

def get_hankeikkuna_modified_date(data):
    modified = data["result"][0]["kohde"]["muokattu"]
    if modified:
        return datetime.fromisoformat(modified)
    return None

def find_preparatory_identifier(data, i):
    identifier = data["result"][i]["kohde"]["tunnus"]
    return identifier


def find_proposal_identifier(data, i):
    he_id_list = data["result"][i]["lainsaadanto"]["heTiedot"]["heNumerot"]
    if he_id_list:
        return he_id_list[0]
    return None


def find_documents(data, i):
    return data["result"][i]["asiakirjat"]


def find_submissions(documents):
    submissions = []
    for i in range(len(documents)):
        if documents[i]["tyyppi"] == "LAUSUNTO":
            name = documents[i]["nimi"].get("fi") or documents[i]["nimi"].get("sv") or documents[i]["nimi"].get("en")
            url = documents[i]["url"]
            if (url and name):
                submission = {
                    "nimi": name,
                    "url": url
                }
                submissions.append(submission)
    return submissions
