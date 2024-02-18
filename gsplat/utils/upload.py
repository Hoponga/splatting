from google.cloud import storage
import time

# ani goat script 
def upload_to_gcs(
    bucket_name, source_file_path, destination_blob_name, credentials_file
):
    # Initialize the Google Cloud Storage client with the credentials
    storage_client = storage.Client.from_service_account_json(credentials_file)

    # Get the target bucket
    bucket = storage_client.bucket(bucket_name)

    # Upload the file to the bucket
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_filename(source_file_path)
    # blob.make_public()

    link = blob.media_link
    print("link: ", blob.media_link)

    print(
        f"File {source_file_path} uploaded to gs://{bucket_name}/{destination_blob_name}"
    )

    return link


if __name__ == "__main__":
    # Replace the following variables with your specific values
    BUCKET_NAME = "output-splat-bucket"
    SOURCE_DIRECTORY = "/tmp/olympe_streaming_test_oavl3n16/"
    SOURCE_FILE = f"streaming-{hash(time.time())}.mp4"
    SOURCE_FILE_PATH = SOURCE_DIRECTORY + "streaming.mp4"
    DESTINATION_BLOB_NAME = "uploaded-" + SOURCE_FILE
    CREDENTIALS_FILE = "./exemplary-fiber-414612-c94072190382.json"

    link = upload_to_gcs(
        BUCKET_NAME, SOURCE_FILE_PATH, DESTINATION_BLOB_NAME, CREDENTIALS_FILE
    )