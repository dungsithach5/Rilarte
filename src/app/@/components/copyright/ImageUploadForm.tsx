'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui-admin/select';

interface ImageUploadFormProps {
	onSubmit: (formData: FormData) => void;
	previewUrl?: string; // optional: để hiển thị ảnh hiện tại (nếu muốn)
}

export default function ImageUploadForm({ onSubmit, previewUrl }: ImageUploadFormProps) {
	const [watermarkEnabled, setWatermarkEnabled] = useState(false);
	const [watermarkText, setWatermarkText] = useState('');
	const [watermarkPosition, setWatermarkPosition] = useState('bottom-right');
	const [downloadProtected, setDownloadProtected] = useState(false);
	const [allowDownload, setAllowDownload] = useState(false);
	const [licenseType, setLicenseType] = useState('all-rights-reserved');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append('watermark_enabled', watermarkEnabled.toString());
		formData.append('watermark_text', watermarkText);
		formData.append('watermark_position', watermarkPosition);
		formData.append('download_protected', downloadProtected.toString());
		formData.append('allow_download', allowDownload.toString());
		formData.append('license_type', licenseType);
		onSubmit(formData);
	};

	return (
		<Card className="w-full max-w-2xl">
			<CardHeader>
				<CardTitle>Copyright Protection Settings</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-6">
					{previewUrl && (
						<div className="space-y-2">
							<Label>Selected Image</Label>
							<img src={previewUrl} alt="Selected" className="max-w-xs rounded" />
						</div>
					)}

					<div className="space-y-4">
						<div className="flex items-center space-x-2">
							<input
								type="checkbox"
								id="watermark"
								checked={watermarkEnabled}
								onChange={(e) => setWatermarkEnabled(e.target.checked)}
							/>
							<Label htmlFor="watermark">Enable Watermark</Label>
						</div>

						{watermarkEnabled && (
							<div className="space-y-2 pl-6">
								<div>
									<Label htmlFor="watermarkText">Watermark Text</Label>
									<Input
										id="watermarkText"
										value={watermarkText}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWatermarkText(e.target.value)}
										placeholder="@artist_name"
									/>
								</div>
								<div>
									<Label htmlFor="position">Position</Label>
									<Select value={watermarkPosition} onValueChange={setWatermarkPosition}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="top-left">Top Left</SelectItem>
											<SelectItem value="top-right">Top Right</SelectItem>
											<SelectItem value="center">Center</SelectItem>
											<SelectItem value="bottom-left">Bottom Left</SelectItem>
											<SelectItem value="bottom-right">Bottom Right</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						)}
					</div>

					<div className="space-y-4">
						<div className="flex items-center space-x-2">
							<input
								type="checkbox"
								id="downloadProtection"
								checked={downloadProtected}
								onChange={(e) => setDownloadProtected(e.target.checked)}
							/>
							<Label htmlFor="downloadProtection">Protect from Download</Label>
						</div>

						<div className="flex items-center space-x-2 pl-6">
							<input
								type="checkbox"
								id="allowDownload"
								checked={allowDownload}
								onChange={(e) => setAllowDownload(e.target.checked)}
							/>
							<Label htmlFor="allowDownload">Allow Download (for others)</Label>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="license">License Type</Label>
						<Select value={licenseType} onValueChange={setLicenseType}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all-rights-reserved">All Rights Reserved</SelectItem>
								<SelectItem value="creative-commons">Creative Commons</SelectItem>
								<SelectItem value="public-domain">Public Domain</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<Button type="submit" className="w-full">Save Settings</Button>
				</form>
			</CardContent>
		</Card>
	);
}
