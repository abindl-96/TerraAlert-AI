-- TerraAlert AI - Sample Guidelines Data
-- Insert sample safety guidelines for landslide prevention and response

USE terraalertai;

-- Insert Guidelines for "Before Landslide" (Prevention)
INSERT INTO guidlines (title, description, type) VALUES
(
    'Monitor Weather Conditions',
    'Stay informed about weather forecasts, especially during monsoon seasons. Pay attention to heavy rainfall warnings and landslide alerts issued by local authorities. Use weather apps and official government alerts to stay updated.',
    'before'
),
(
    'Inspect Your Property Regularly',
    'Regularly inspect your property for signs of potential landslides such as cracks in walls, tilting trees, bulging ground, or new springs. Check drainage systems and ensure they are clear of debris. Look for changes in water flow patterns.',
    'before'
),
(
    'Maintain Proper Drainage',
    'Ensure proper drainage around your property. Clean gutters, downspouts, and drainage ditches regularly. Divert water away from slopes using proper drainage systems. Avoid blocking natural water channels.',
    'before'
),
(
    'Avoid Building on Steep Slopes',
    'If possible, avoid building on steep slopes or near cliff edges. If you must build on a slope, consult with geotechnical engineers and follow local building codes. Use retaining walls and proper foundation systems.',
    'before'
),
(
    'Plant Vegetation on Slopes',
    'Plant deep-rooted vegetation on slopes to help stabilize the soil. Trees and shrubs with extensive root systems can help prevent soil erosion and landslides. Avoid removing existing vegetation from slopes.',
    'before'
),
(
    'Prepare an Emergency Kit',
    'Prepare an emergency kit with essential supplies including water, non-perishable food, first aid kit, flashlight, batteries, important documents, and emergency contact numbers. Keep the kit in an easily accessible location.',
    'before'
),
(
    'Create an Evacuation Plan',
    'Develop and practice an evacuation plan with your family. Identify safe evacuation routes away from slopes and valleys. Establish a meeting point and ensure all family members know the plan. Keep emergency contact numbers handy.',
    'before'
);

-- Insert Guidelines for "During Landslide" (Response)
INSERT INTO guidlines (title, description, type) VALUES
(
    'Evacuate Immediately',
    'If you notice signs of an imminent landslide (cracking sounds, rapid water flow, ground movement), evacuate immediately. Do not wait for official warnings. Move to higher ground or a safe location away from the slope.',
    'during'
),
(
    'Stay Away from Slopes',
    'During heavy rainfall or landslide warnings, stay away from steep slopes, cliffs, and areas prone to landslides. Avoid driving through areas with known landslide risks. Do not attempt to cross debris flows.',
    'during'
),
(
    'Listen for Warning Signs',
    'Listen for unusual sounds such as trees cracking, boulders knocking together, or rumbling sounds. These may indicate an approaching landslide. If you hear these sounds, move to safety immediately.',
    'during'
),
(
    'Avoid Low-Lying Areas',
    'During heavy rainfall, avoid low-lying areas, valleys, and areas near streams or rivers. These areas are more susceptible to debris flows and flash floods that often accompany landslides.',
    'during'
),
(
    'Do Not Return to Evacuated Areas',
    'Once you have evacuated, do not return to the area until authorities declare it safe. Landslides can continue for hours or days after the initial event. Wait for official clearance before returning.',
    'during'
),
(
    'Stay Informed',
    'Keep listening to local radio, TV, or official social media channels for updates and instructions from authorities. Follow evacuation orders immediately and do not delay.',
    'during'
);

-- Insert Guidelines for "After Landslide" (Recovery)
INSERT INTO guidlines (title, description, type) VALUES
(
    'Wait for Official Clearance',
    'Do not return to the affected area until local authorities have declared it safe. Landslides can trigger additional slides, and the area may still be unstable. Wait for professional assessment before returning.',
    'after'
),
(
    'Check for Injuries',
    'After a landslide, check yourself and others for injuries. Provide first aid if needed and seek medical attention for serious injuries. Be aware that medical services may be overwhelmed, so prioritize critical cases.',
    'after'
),
(
    'Avoid Damaged Buildings',
    'Do not enter damaged buildings or structures. They may be unstable and could collapse. Wait for structural engineers to assess the safety of buildings before entering. Report damaged structures to authorities.',
    'after'
),
(
    'Watch for Additional Slides',
    'Be alert for additional landslides. Heavy rainfall can trigger multiple slides. Stay away from slopes and unstable areas. Monitor weather conditions and be prepared to evacuate again if necessary.',
    'after'
),
(
    'Document Damage',
    'Take photographs of damage to your property for insurance purposes. Document all losses and damages. Contact your insurance company as soon as possible to file a claim. Keep all receipts for emergency expenses.',
    'after'
),
(
    'Check Utilities',
    'Check for gas leaks, electrical damage, and water line breaks. If you smell gas or see damaged electrical lines, turn off utilities at the main switch and contact utility companies. Do not use damaged utilities.',
    'after'
),
(
    'Seek Professional Help',
    'Contact professional geotechnical engineers to assess slope stability before rebuilding. Consult with local authorities about rebuilding regulations and safety requirements. Follow recommended safety measures.',
    'after'
),
(
    'Support Community Recovery',
    'Work with your community and local authorities for recovery efforts. Help neighbors who may need assistance. Participate in community cleanup and rebuilding efforts while following safety guidelines.',
    'after'
);

-- Verify the insertions
SELECT COUNT(*) as total_guidelines, type, COUNT(*) as count_by_type 
FROM guidlines 
GROUP BY type;
