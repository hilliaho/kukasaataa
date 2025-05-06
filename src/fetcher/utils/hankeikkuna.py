def process_hankeikkuna_data(data):
    submission_data = []
    size = data["size"]
    for i in range(size):
        preparatory_identifier = find_preparatory_identifier(data, i)
        proposal_identifier = find_proposal_identifier(data, i)
        if not proposal_identifier:
            continue
        documents = find_documents(data, i)
        submissions = find_submissions(documents)
        project_submissions = {
            "preparatoryIdentifier": preparatory_identifier,
            "proposalIdentifier": proposal_identifier,
            "submissions": submissions,
        }
        submission_data.append(project_submissions)
    return submission_data


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
            submission = {
                "nimi": documents[i]["nimi"]["fi"],
                "url": documents[i]["url"],
            }
            submissions.append(submission)
    return submissions
